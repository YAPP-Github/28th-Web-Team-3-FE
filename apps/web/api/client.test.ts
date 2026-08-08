import type { TokenProvider } from "@repo/api/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const state: { tokenProvider?: TokenProvider; isNativeApp: boolean } = { isNativeApp: false };
  return {
    state,
    createApiClient: vi.fn((config: { tokenProvider: TokenProvider }) => {
      state.tokenProvider = config.tokenProvider;
      return {};
    }),
    getAccessToken: vi.fn().mockResolvedValue("native-token"),
    refreshAccessToken: vi.fn().mockResolvedValue("rotated-token"),
  };
});

vi.mock("client-only", () => ({}));
vi.mock("@repo/api/client", () => ({ createApiClient: mocks.createApiClient }));
vi.mock("@repo/bridge", () => ({
  bridge: {
    getAccessToken: mocks.getAccessToken,
    refreshAccessToken: mocks.refreshAccessToken,
  },
  isNativeApp: () => mocks.state.isNativeApp,
}));

async function loadTokenProvider(isNativeApp: boolean) {
  mocks.state.isNativeApp = isNativeApp;
  await import("./client");
  return mocks.state.tokenProvider;
}

describe("web api token provider", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("네이티브 셸 밖에서는 토큰을 얻을 수단이 없어 헤더 없이 보낸다", async () => {
    const tokenProvider = await loadTokenProvider(false);

    await expect(tokenProvider?.getAccessToken()).resolves.toBeNull();
    await expect(tokenProvider?.refreshAccessToken()).resolves.toBeNull();
    expect(mocks.getAccessToken).not.toHaveBeenCalled();
    expect(mocks.refreshAccessToken).not.toHaveBeenCalled();
  });

  it("네이티브 셸 안에서는 bridge로 access token을 당겨 오고 사본을 재사용한다", async () => {
    const tokenProvider = await loadTokenProvider(true);

    await expect(tokenProvider?.getAccessToken()).resolves.toBe("native-token");
    await expect(tokenProvider?.getAccessToken()).resolves.toBe("native-token");
    expect(mocks.getAccessToken).toHaveBeenCalledTimes(1);
  });

  it("재발급은 네이티브에 위임하고 동시 호출을 하나로 묶는다", async () => {
    const tokenProvider = await loadTokenProvider(true);

    await expect(
      Promise.all([tokenProvider?.refreshAccessToken(), tokenProvider?.refreshAccessToken()]),
    ).resolves.toEqual(["rotated-token", "rotated-token"]);
    expect(mocks.refreshAccessToken).toHaveBeenCalledTimes(1);
  });

  it("재발급된 토큰이 이후 조회에 반영된다", async () => {
    const tokenProvider = await loadTokenProvider(true);

    await tokenProvider?.getAccessToken();
    await tokenProvider?.refreshAccessToken();

    await expect(tokenProvider?.getAccessToken()).resolves.toBe("rotated-token");
    expect(mocks.getAccessToken).toHaveBeenCalledTimes(1);
  });

  it("bridge 호출이 실패해도 던지지 않고 토큰 없이 진행한다", async () => {
    mocks.getAccessToken.mockRejectedValueOnce(new Error("bridge timeout"));
    const tokenProvider = await loadTokenProvider(true);

    await expect(tokenProvider?.getAccessToken()).resolves.toBeNull();
  });
});
