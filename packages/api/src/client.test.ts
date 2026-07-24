import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApiClient, type TokenProvider } from "./client";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function makeProvider(overrides: Partial<TokenProvider> = {}) {
  return {
    getAccessToken: vi.fn().mockResolvedValue("access-1"),
    refreshAccessToken: vi.fn().mockResolvedValue("access-2"),
    ...overrides,
  };
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

describe("createApiClient + tokenProvider", () => {
  it("baseUrl에 경로가 있어도 trailing slash 없이 상대 경로를 이어 붙인다", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));
    const api = createApiClient({ baseUrl: "https://api.test/api" });

    await api.get("onboarding/profile").json();

    const sent = fetchMock.mock.calls[0]?.[0] as Request;
    expect(sent.url).toBe("https://api.test/api/onboarding/profile");
  });

  it("모든 요청에 Bearer access token을 붙인다", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));
    const api = createApiClient({ baseUrl: "https://api.test", tokenProvider: makeProvider() });

    await api.get("ping").json();

    const sent = fetchMock.mock.calls[0]?.[0] as Request;
    expect(sent.headers.get("authorization")).toBe("Bearer access-1");
  });

  it("토큰이 null이면 Authorization 헤더를 생략한다", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));
    const provider = makeProvider({ getAccessToken: vi.fn().mockResolvedValue(null) });
    const api = createApiClient({ baseUrl: "https://api.test", tokenProvider: provider });

    await api.get("ping").json();

    const sent = fetchMock.mock.calls[0]?.[0] as Request;
    expect(sent.headers.get("authorization")).toBeNull();
  });

  it("401이면 재발급 후 새 토큰으로 1회 재시도한다", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ code: "ACCESS_EXPIRED" }, 401))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));
    const provider = makeProvider();
    const api = createApiClient({ baseUrl: "https://api.test", tokenProvider: provider });

    const body = await api.get("me").json();

    expect(body).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const retried = fetchMock.mock.calls[1]?.[0] as Request;
    expect(retried.headers.get("authorization")).toBe("Bearer access-2");
  });

  it("재발급이 실패하면(null) 재시도 없이 401 에러를 던진다", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ code: "REFRESH_EXPIRED" }, 401));
    const provider = makeProvider({ refreshAccessToken: vi.fn().mockResolvedValue(null) });
    const api = createApiClient({ baseUrl: "https://api.test", tokenProvider: provider });

    await expect(api.get("me").json()).rejects.toMatchObject({ name: "ApiError" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("재시도 후에도 401이면 재발급을 반복하지 않는다", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ code: "ACCESS_EXPIRED" }, 401));
    const provider = makeProvider();
    const api = createApiClient({ baseUrl: "https://api.test", tokenProvider: provider });

    await expect(api.get("me").json()).rejects.toMatchObject({ name: "ApiError" });

    expect(provider.refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("POST 재시도에도 body가 보존된다", async () => {
    // body는 스트림이라 호출이 끝난 뒤에는 읽을 수 없다 — fetch가 받는 시점에 바로 캡처.
    const bodies: (string | null)[] = [];
    fetchMock.mockImplementation(async (request: Request) => {
      bodies.push(
        await request
          .clone()
          .text()
          .catch(() => null),
      );
      return bodies.length === 1
        ? jsonResponse({ code: "ACCESS_EXPIRED" }, 401)
        : jsonResponse({ ok: true });
    });
    const api = createApiClient({ baseUrl: "https://api.test", tokenProvider: makeProvider() });

    await api.post("items", { json: { name: "테스트" } }).json();

    expect(bodies).toHaveLength(2);
    expect(bodies[1]).toBe(JSON.stringify({ name: "테스트" }));
  });

  it("tokenProvider가 없으면 헤더 추가/재시도 없이 그대로 동작한다", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, 401));
    const api = createApiClient({ baseUrl: "https://api.test" });

    await expect(api.get("me").json()).rejects.toMatchObject({ name: "ApiError" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
