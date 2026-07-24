import type { TokenProvider } from "@repo/api/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const state: { tokenProvider?: TokenProvider } = {};
  return {
    state,
    createApiClient: vi.fn((config: { tokenProvider: TokenProvider }) => {
      state.tokenProvider = config.tokenProvider;
      return {};
    }),
    getBrowserAccessToken: vi.fn().mockResolvedValue("browser-token"),
    refreshBrowserAccessToken: vi.fn().mockResolvedValue("refreshed-token"),
  };
});

vi.mock("client-only", () => ({}));
vi.mock("@repo/api/client", () => ({ createApiClient: mocks.createApiClient }));
vi.mock("@repo/bridge", () => ({
  bridge: {},
  isNativeApp: () => false,
}));
vi.mock("@/lib/browser-guest-auth", () => ({
  getBrowserAccessToken: mocks.getBrowserAccessToken,
  refreshBrowserAccessToken: mocks.refreshBrowserAccessToken,
}));

async function loadTokenProvider(utAuthEnabled: boolean) {
  vi.stubEnv("NEXT_PUBLIC_ENABLE_UT_GUEST_AUTH", String(utAuthEnabled));
  await import("./api");
  return mocks.state.tokenProvider;
}

describe("web api token provider", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("UT 플래그가 꺼진 일반 브라우저에서는 임시 게스트 인증을 사용하지 않는다", async () => {
    const tokenProvider = await loadTokenProvider(false);

    await expect(tokenProvider?.getAccessToken()).resolves.toBeNull();
    await expect(tokenProvider?.refreshAccessToken()).resolves.toBeNull();
    expect(mocks.getBrowserAccessToken).not.toHaveBeenCalled();
    expect(mocks.refreshBrowserAccessToken).not.toHaveBeenCalled();
  });

  it("UT 플래그가 켜진 일반 브라우저에서만 sessionStorage 기반 인증을 사용한다", async () => {
    const tokenProvider = await loadTokenProvider(true);

    await expect(tokenProvider?.getAccessToken()).resolves.toBe("browser-token");
    await expect(tokenProvider?.refreshAccessToken()).resolves.toBe("refreshed-token");
  });
});
