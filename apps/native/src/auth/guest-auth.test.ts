import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * guest-auth는 모듈 레벨 상태(accessToken·inflight)를 들고 있어 테스트마다 새로 import해야
 * 한다. SecureStore는 인메모리 Map으로 실제 저장 동작을 흉내 내고, config는 expo-constants·
 * react-native을 끌고 오므로 통째로 대체한다(vitest는 node 환경에서 돈다).
 */

const secureStore = vi.hoisted(() => new Map<string, string>());

vi.mock("expo-secure-store", () => ({
  WHEN_UNLOCKED: "whenUnlocked",
  getItemAsync: vi.fn(async (key: string) => secureStore.get(key) ?? null),
  setItemAsync: vi.fn(async (key: string, value: string) => {
    secureStore.set(key, value);
  }),
  deleteItemAsync: vi.fn(async (key: string) => {
    secureStore.delete(key);
  }),
}));

vi.mock("expo-crypto", () => ({ randomUUID: vi.fn(() => "generated-uuid") }));

vi.mock("../config", () => ({ API_URL: "https://api.test/" }));

const UUID_KEY = "guest_device_uuid";
const REFRESH_TOKEN_KEY = "guest_refresh_token";
const REFRESH_URL = "https://api.test/auth/guest/refresh";
const ISSUE_URL = "https://api.test/auth/guest";
// guest-auth.ts의 AUTH_FETCH_TIMEOUT_MS와 같은 값. 내보내면 프로덕션 API가 테스트 때문에
// 넓어지므로 여기서 복제하고, 경계(-1ms)까지 검증해 값이 바뀌면 테스트가 깨지게 둔다.
const AUTH_FETCH_TIMEOUT_MS = 10_000;

let fetchMock: ReturnType<typeof vi.fn>;

/** resetModules 후에는 목 모듈도 새 인스턴스라 guest-auth와 함께 다시 가져와야 한다. */
async function load() {
  const SecureStore = await import("expo-secure-store");
  const Crypto = await import("expo-crypto");
  const guestAuth = await import("./guest-auth");
  return { SecureStore, Crypto, guestAuth };
}

function tokenResponse(tokens: { accessToken: string; refreshToken: string }) {
  return { ok: true, status: 200, json: async () => tokens };
}

function errorResponse(status: number) {
  return { ok: false, status };
}

/** n번째 fetch 호출의 URL·body. 호출이 없으면 인덱스가 조용히 undefined가 되므로 여기서 깬다. */
function fetchCall(index: number) {
  const call = fetchMock.mock.calls[index];
  if (!call) throw new Error(`fetch 호출 #${index}가 없다`);
  const [url, init] = call as [string, { body: string }];
  return { url, body: init.body };
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  secureStore.clear();
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("single-flight", () => {
  it("동시 호출이 몰려도 서버 요청은 1회만 나간다", async () => {
    secureStore.set(REFRESH_TOKEN_KEY, "stored-refresh");
    fetchMock.mockResolvedValue(tokenResponse({ accessToken: "a1", refreshToken: "r1" }));
    const { guestAuth } = await load();

    const results = await Promise.all([
      guestAuth.getAccessToken(),
      guestAuth.refreshAccessToken(),
      guestAuth.initGuestAuth(),
      guestAuth.getAccessToken(),
    ]);

    expect(results).toEqual(["a1", "a1", "a1", "a1"]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("rotation", () => {
  it("rotation된 refreshToken 저장이 accessToken 반환보다 먼저 끝난다", async () => {
    secureStore.set(REFRESH_TOKEN_KEY, "stored-refresh");
    fetchMock.mockResolvedValue(tokenResponse({ accessToken: "a1", refreshToken: "rotated" }));
    const { SecureStore, guestAuth } = await load();

    let finishStore: (() => void) | undefined;
    vi.mocked(SecureStore.setItemAsync).mockImplementationOnce(
      (key, value) =>
        new Promise<void>((resolve) => {
          finishStore = () => {
            secureStore.set(key, value);
            resolve();
          };
        }),
    );

    const pending = guestAuth.initGuestAuth();
    let settled = false;
    void pending.then(() => {
      settled = true;
    });

    await vi.waitFor(() => expect(finishStore).toBeDefined());
    // 저장이 끝나기 전에 accessToken이 나가면, 그 사이 앱이 죽었을 때 폐기된 구 토큰만 남는다.
    expect(settled).toBe(false);
    expect(secureStore.get(REFRESH_TOKEN_KEY)).toBe("stored-refresh");

    finishStore?.();
    await expect(pending).resolves.toBe("a1");
    expect(secureStore.get(REFRESH_TOKEN_KEY)).toBe("rotated");
  });
});

describe("일시 장애", () => {
  /** 공통 기대: null로 끝나고, 신규 발급을 시도하지 않으며, 저장된 refreshToken이 남는다. */
  async function expectTransientFailure() {
    secureStore.set(REFRESH_TOKEN_KEY, "stored-refresh");
    const { SecureStore, guestAuth } = await load();

    await expect(guestAuth.initGuestAuth()).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchCall(0).url).toBe(REFRESH_URL);
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
    expect(secureStore.get(REFRESH_TOKEN_KEY)).toBe("stored-refresh");
  }

  it("429는 신규 발급으로 이어지지 않는다", async () => {
    // rate limit 걸린 서버에 요청을 보태지 않는다.
    fetchMock.mockResolvedValue(errorResponse(429));
    await expectTransientFailure();
  });

  it("408도 신규 발급으로 이어지지 않는다", async () => {
    fetchMock.mockResolvedValue(errorResponse(408));
    await expectTransientFailure();
  });

  it("5xx는 저장된 refreshToken을 건드리지 않는다", async () => {
    fetchMock.mockResolvedValue(errorResponse(503));
    await expectTransientFailure();
  });

  it("네트워크 실패는 저장된 refreshToken을 건드리지 않는다", async () => {
    fetchMock.mockRejectedValue(new TypeError("Network request failed"));
    await expectTransientFailure();
  });

  it("스키마에 맞지 않는 응답도 저장된 refreshToken을 건드리지 않는다", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ accessToken: "a1" }),
    });
    await expectTransientFailure();
  });
});

describe("타임아웃", () => {
  it("응답이 오지 않아도 abort로 settle되어 inflight를 비운다", async () => {
    secureStore.set(REFRESH_TOKEN_KEY, "stored-refresh");
    // abort에만 반응하는 응답 — 타임아웃이 없으면 영원히 pending이다.
    fetchMock.mockImplementation(
      (_url: string, init: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener("abort", () => reject(new Error("aborted")));
        }),
    );
    const { guestAuth } = await load();
    vi.useFakeTimers();

    const first = guestAuth.initGuestAuth();
    let settled = false;
    void first.then(() => {
      settled = true;
    });

    await vi.advanceTimersByTimeAsync(AUTH_FETCH_TIMEOUT_MS - 1);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await expect(first).resolves.toBeNull();

    // inflight가 남아 있으면 이 호출은 새 요청 없이 앞의 실패를 그대로 돌려준다 —
    // 앱 재시작 전까지 인증이 영구히 막힌다.
    const second = guestAuth.getAccessToken();
    await vi.advanceTimersByTimeAsync(AUTH_FETCH_TIMEOUT_MS);
    await expect(second).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("기기 uuid", () => {
  it("최초 1회만 생성하고 이후 부트에서는 저장된 값을 재사용한다", async () => {
    fetchMock.mockResolvedValue(tokenResponse({ accessToken: "a1", refreshToken: "r1" }));
    const first = await load();

    await expect(first.guestAuth.initGuestAuth()).resolves.toBe("a1");
    expect(first.Crypto.randomUUID).toHaveBeenCalledTimes(1);
    expect(first.SecureStore.setItemAsync).toHaveBeenCalledWith(
      UUID_KEY,
      "generated-uuid",
      expect.anything(),
    );
    expect(fetchCall(0).url).toBe(ISSUE_URL);
    expect(fetchCall(0).body).toBe(JSON.stringify({ uuid: "generated-uuid" }));

    // 새 부트를 흉내 낸다 — 모듈 상태만 비우고 SecureStore(키체인)는 그대로 둔다.
    vi.mocked(first.Crypto.randomUUID).mockClear();
    secureStore.delete(REFRESH_TOKEN_KEY);
    vi.resetModules();
    const second = await load();

    await expect(second.guestAuth.initGuestAuth()).resolves.toBe("a1");
    expect(second.Crypto.randomUUID).not.toHaveBeenCalled();
    expect(fetchCall(1).body).toBe(JSON.stringify({ uuid: "generated-uuid" }));
  });
});

describe("거부된 refreshToken 정리", () => {
  it("신규 발급까지 실패하면 거부된 refreshToken을 지운다", async () => {
    secureStore.set(REFRESH_TOKEN_KEY, "dead-refresh");
    fetchMock
      .mockResolvedValueOnce(errorResponse(401)) // refresh 거부 — 토큰이 실제로 무효
      .mockResolvedValueOnce(errorResponse(500)); // 신규 발급은 일시 장애로 실패
    const { SecureStore, guestAuth } = await load();

    await expect(guestAuth.initGuestAuth()).resolves.toBeNull();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(REFRESH_TOKEN_KEY);
    expect(secureStore.has(REFRESH_TOKEN_KEY)).toBe(false);

    // 남겨 두면 이후 모든 reissue가 실패가 확정된 refresh 왕복을 한 번 버리고 시작한다.
    fetchMock.mockResolvedValue(tokenResponse({ accessToken: "a1", refreshToken: "r1" }));
    await expect(guestAuth.refreshAccessToken()).resolves.toBe("a1");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchCall(2).url).toBe(ISSUE_URL);
  });

  it("신규 발급이 성공하면 새 refreshToken으로 대체된다", async () => {
    secureStore.set(REFRESH_TOKEN_KEY, "dead-refresh");
    fetchMock
      .mockResolvedValueOnce(errorResponse(401))
      .mockResolvedValueOnce(tokenResponse({ accessToken: "a1", refreshToken: "fresh" }));
    const { guestAuth } = await load();

    await expect(guestAuth.initGuestAuth()).resolves.toBe("a1");
    expect(fetchCall(1).url).toBe(ISSUE_URL);
    expect(secureStore.get(REFRESH_TOKEN_KEY)).toBe("fresh");
  });

  it("저장된 refreshToken이 없으면 삭제를 시도하지 않는다", async () => {
    fetchMock.mockResolvedValue(errorResponse(500));
    const { SecureStore, guestAuth } = await load();

    await expect(guestAuth.initGuestAuth()).resolves.toBeNull();
    expect(fetchCall(0).url).toBe(ISSUE_URL);
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });
});

describe("clearGuestTokens", () => {
  /**
   * 비우지 않으면: 삭제된 계정의 access token으로 첫 요청이 401 → refresh도 삭제된
   * refresh token이라 거부당하고서야 uuid로 신규 발급한다(왕복 2회 낭비). 미리 비워
   * 두면 다음 getAccessToken이 refresh 시도 없이 곧장 신규 발급으로 간다.
   */
  it("이후 getAccessToken이 refresh 없이 곧장 신규 발급한다", async () => {
    secureStore.set(REFRESH_TOKEN_KEY, "withdrawn-refresh");
    fetchMock.mockResolvedValue(tokenResponse({ accessToken: "a1", refreshToken: "r1" }));
    const { SecureStore, guestAuth } = await load();
    await guestAuth.initGuestAuth();
    fetchMock.mockClear();
    fetchMock.mockResolvedValue(tokenResponse({ accessToken: "a2", refreshToken: "r2" }));

    await guestAuth.clearGuestTokens();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(REFRESH_TOKEN_KEY);
    await expect(guestAuth.getAccessToken()).resolves.toBe("a2");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchCall(0).url).toBe(ISSUE_URL);
  });
});
