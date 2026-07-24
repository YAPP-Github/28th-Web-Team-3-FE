import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();
const DEVICE_UUID = "c4ffb5fe-9fb5-4f9d-aa26-9c31c66cc4f1";
const randomUuid = vi.fn(() => DEVICE_UUID);

function tokenResponse(accessToken: string) {
  return {
    ok: true,
    json: () => Promise.resolve({ accessToken, refreshToken: "discarded-refresh-token" }),
  };
}

describe("browser guest auth", () => {
  beforeEach(() => {
    vi.resetModules();
    sessionStorage.clear();
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.test/api";
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("crypto", { randomUUID: randomUuid });
    fetchMock.mockReset();
    randomUuid.mockClear();
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_API_URL;
    vi.unstubAllGlobals();
  });

  it("동시 요청에는 sessionStorage UUID로 access token을 한 번만 발급한다", async () => {
    fetchMock.mockResolvedValue(tokenResponse("access-token"));
    const { getBrowserAccessToken } = await import("./browser-guest-auth");

    await expect(Promise.all([getBrowserAccessToken(), getBrowserAccessToken()])).resolves.toEqual([
      "access-token",
      "access-token",
    ]);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      new URL("https://api.example.test/api/auth/guest"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ uuid: DEVICE_UUID }),
      }),
    );
    expect(sessionStorage.getItem("ut_guest_device_uuid")).toBe(DEVICE_UUID);
    expect(sessionStorage.length).toBe(1);
  });

  it("401 이후 같은 UUID로 access token만 다시 발급한다", async () => {
    fetchMock
      .mockResolvedValueOnce(tokenResponse("first-token"))
      .mockResolvedValueOnce(tokenResponse("rotated-token"));
    const { getBrowserAccessToken, refreshBrowserAccessToken } = await import(
      "./browser-guest-auth"
    );

    await getBrowserAccessToken();
    await expect(refreshBrowserAccessToken()).resolves.toBe("rotated-token");

    const bodies = fetchMock.mock.calls.map(([, options]) => options.body);
    expect(bodies).toEqual([
      JSON.stringify({ uuid: DEVICE_UUID }),
      JSON.stringify({ uuid: DEVICE_UUID }),
    ]);
    expect(randomUuid).toHaveBeenCalledOnce();
    expect(sessionStorage.getItem("ut_guest_refresh_token")).toBeNull();
  });

  it("API URL 끝에 슬래시가 있어도 /api 경로를 보존한다", async () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.test/api/";
    fetchMock.mockResolvedValue(tokenResponse("access-token"));
    const { getBrowserAccessToken } = await import("./browser-guest-auth");

    await getBrowserAccessToken();

    expect(fetchMock).toHaveBeenCalledWith(
      new URL("https://api.example.test/api/auth/guest"),
      expect.anything(),
    );
  });
});
