import ky, { type KyInstance } from "ky";

/**
 * 토큰 공급자 — 게스트 인증에서 access token의 원본은 네이티브(RN) 메모리이고,
 * 웹은 bridge로 당겨 온다(pull). 공급자가 없으면(일반 브라우저, 서버) 헤더를 생략한다.
 */
export type TokenProvider = {
  /** 현재 access token. null이면 Authorization 헤더 생략. */
  getAccessToken(): Promise<string | null>;
  /** 401 이후 재발급. 새 access token, 실패 시 null(401이 그대로 전파된다). */
  refreshAccessToken(): Promise<string | null>;
};

export type ApiClientOptions = {
  baseUrl?: string;
  tokenProvider?: TokenProvider;
};

/**
 * baseUrl은 반드시 `/`로 끝나야 한다 — 웹 표준 URL 해석은 끝 슬래시가 없으면 마지막
 * 경로 조각을 대체한다(`.../api` + `goal` → `.../goal`). 미용이 아니라 없으면 깨진다.
 */
function normalizeBaseUrl(baseUrl?: string) {
  const resolved = baseUrl ?? process.env.NEXT_PUBLIC_API_URL ?? "/";
  return resolved.endsWith("/") ? resolved : `${resolved}/`;
}

/**
 * 전송 계층 — baseUrl·인증 헤더·재시도·에러 이름까지가 여기 책임이고, 요청·응답
 * 스키마 검증은 `./http.ts`가 이 인스턴스를 감싸서 맡는다.
 *
 * tokenProvider를 주면 모든 요청에 Bearer access token을 싣고, 401이면 재발급 후
 * 1회 재시도한다. 쿠키·세션은 쓰지 않으므로 credentials를 켜지 않는다(기본 same-origin).
 */
export function createApiClient({ baseUrl, tokenProvider }: ApiClientOptions = {}): KyInstance {
  return ky.create({
    baseUrl: normalizeBaseUrl(baseUrl),
    // 재시도의 단일 소유자 — react-query 기본값(`./query-client.tsx`)은 retry를 끄고
    // 여기에 맡긴다. 양쪽 다 켜면 두 레이어가 곱해져 GET 한 번이 최대 6요청이 된다.
    retry: { limit: 2, methods: ["get"] },
    hooks: {
      beforeRequest: tokenProvider
        ? [
            async ({ request }) => {
              const accessToken = await tokenProvider.getAccessToken();
              if (accessToken) request.headers.set("Authorization", `Bearer ${accessToken}`);
            },
          ]
        : [],
      afterResponse: tokenProvider
        ? [
            async ({ request, response }) => {
              if (response.status !== 401) return;
              const accessToken = await tokenProvider.refreshAccessToken();
              // 재발급 실패 — 401을 손대지 않고 흘려보내 beforeError로 떨어뜨린다.
              if (!accessToken) return;
              request.headers.set("Authorization", `Bearer ${accessToken}`);
              // 인스턴스가 아닌 순정 ky로 보낸다. 인스턴스로 보내면 이 훅이 다시 붙어
              // 401 → 재발급 → 401이 무한히 돈다. retry 0까지 더해 재시도를 정확히 1회로 묶는다.
              // throwHttpErrors:false — 이 응답을 최종 응답으로 돌려주고, 여전히 401이면
              // 인스턴스의 평소 에러 경로로 일관되게 흘려보낸다.
              return ky(request, { throwHttpErrors: false, retry: { limit: 0 } });
            },
          ]
        : [],
      beforeError: [
        ({ error }) => {
          // 이 클라이언트에서 나온 에러를 로그·Sentry에서 한 이름으로 묶는다. 상태 코드나
          // 서버 에러 코드로 분기할 때는 호출부가 HTTPError와 error.data를 본다.
          error.name = "ApiError";
          // ky v2의 beforeError는 state 객체를 넘기고 수정한 Error를 되돌려받길 기대한다.
          return error;
        },
      ],
    },
  });
}
