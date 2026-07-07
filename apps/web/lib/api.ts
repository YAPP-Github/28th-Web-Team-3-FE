import { createApiClient, type TokenProvider } from "@repo/api/client";
import { bridge, isNativeApp } from "@repo/bridge";

/**
 * 웹 앱 전용 API 클라이언트. 네이티브 WebView 안에서는 access token을 bridge로
 * 당겨 와(pull) Authorization 헤더에 싣고, 401이면 네이티브에 재발급을 요청한 뒤
 * 1회 재시도한다. 일반 브라우저에서는 토큰 없이 동작한다(MSW 개발용).
 *
 * 클라이언트 컴포넌트에서만 import할 것 — bridge는 브라우저 전용이고,
 * 서버 컴포넌트(RSC)는 게스트 토큰에 접근할 수 없다.
 */

// 동시 401에 대한 웹 쪽 single-flight. 네이티브도 자체 single-flight를 갖지만,
// 여기서 묶으면 bridge 왕복 자체가 1회로 줄어든다.
let refreshInflight: Promise<string | null> | null = null;

const tokenProvider: TokenProvider = {
  getAccessToken: () =>
    isNativeApp() ? bridge.getAccessToken().catch(() => null) : Promise.resolve(null),
  refreshAccessToken: () => {
    if (!isNativeApp()) return Promise.resolve(null);
    refreshInflight ??= bridge
      .refreshAccessToken()
      .catch(() => null)
      .finally(() => {
        refreshInflight = null;
      });
    return refreshInflight;
  },
};

export const api = createApiClient({ tokenProvider });
