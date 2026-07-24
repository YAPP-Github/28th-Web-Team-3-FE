import "client-only";

import { createApiClient, type TokenProvider } from "@repo/api/client";
import { bridge, isNativeApp } from "@repo/bridge";
import { getBrowserAccessToken, refreshBrowserAccessToken } from "@/lib/browser-guest-auth";

/**
 * 웹 앱 전용 API 클라이언트. 네이티브 WebView 안에서는 access token을 bridge로
 * 당겨 와(pull) Authorization 헤더에 싣고, 401이면 네이티브에 재발급을 요청한 뒤
 * 1회 재시도한다. 임시 UT 환경의 일반 브라우저에서는 sessionStorage의 UUID로
 * 백엔드에서 access token을 직접 발급받는다.
 *
 * bridge는 브라우저 전용이고 서버 컴포넌트(RSC)는 게스트 토큰에 접근할 수 없으므로,
 * "client-only"로 서버 번들 유입을 빌드 타임에 차단한다.
 */

// access token은 네이티브 메모리가 원본. 웹은 사본만 캐시해 요청마다 bridge를
// 왕복하지 않는다. 만료돼 서버가 401을 주면 refreshAccessToken이 사본을 새로 채운다.
// (캐시가 만료 토큰을 들고 있어도 401 → 재발급 → 재시도로 자가치유된다.)
let cachedToken: string | null = null;
// 동시 401에 대한 웹 쪽 single-flight. 네이티브도 자체 single-flight를 갖지만,
// 여기서 묶으면 bridge 왕복 자체가 1회로 줄어든다.
let refreshInflight: Promise<string | null> | null = null;
const isUtGuestAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_UT_GUEST_AUTH === "true";

const tokenProvider: TokenProvider = {
  getAccessToken: async () => {
    if (!isNativeApp()) return isUtGuestAuthEnabled ? getBrowserAccessToken() : null;
    if (cachedToken === null) {
      cachedToken = await bridge.getAccessToken().catch(() => null);
    }
    return cachedToken;
  },
  refreshAccessToken: () => {
    if (!isNativeApp()) {
      return isUtGuestAuthEnabled ? refreshBrowserAccessToken() : Promise.resolve(null);
    }
    refreshInflight ??= bridge
      .refreshAccessToken()
      .then((token) => {
        cachedToken = token;
        return token;
      })
      .catch(() => {
        cachedToken = null;
        return null;
      })
      .finally(() => {
        refreshInflight = null;
      });
    return refreshInflight;
  },
};

export const api = createApiClient({ tokenProvider });
