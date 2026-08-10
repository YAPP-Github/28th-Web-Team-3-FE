import "client-only";

import { createApiClient, type TokenProvider } from "@repo/api/client";
import { createHttp } from "@repo/api/http";
import { bridge, isNativeApp } from "@repo/bridge";

/**
 * 웹 앱 전용 API 클라이언트. access token의 원본은 네이티브(RN) 메모리이고, 웹은
 * bridge로 당겨 와(pull) Authorization 헤더에 싣는다. 401이면 네이티브에 재발급을
 * 요청한 뒤 1회 재시도한다.
 *
 * 네이티브 셸 밖(일반 브라우저)에는 토큰을 얻을 수단이 없다 — 기기 uuid와 refresh
 * token이 네이티브 SecureStore에만 있기 때문이다. 이때는 헤더 없이 보내고 서버가
 * 401로 판단하게 둔다. 이 앱은 네이티브 셸 안에서 동작하는 것을 전제로 한다.
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

const tokenProvider: TokenProvider = {
  getAccessToken: async () => {
    if (!isNativeApp()) return null;
    if (cachedToken === null) {
      cachedToken = await bridge.getAccessToken().catch(() => null);
    }
    return cachedToken;
  },
  refreshAccessToken: () => {
    if (!isNativeApp()) return Promise.resolve(null);
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

/** ky 인스턴스. 옵션을 직접 다뤄야 할 때만 쓰고, 평소에는 아래 `http`를 쓴다. */
export const api = createApiClient({ tokenProvider });

/** 스키마를 아는 HTTP 클라이언트 — 각 기능의 api.ts는 이걸 쓴다. */
export const http = createHttp(api);
