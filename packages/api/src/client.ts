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
 * Shared HTTP client. tokenProvider가 있으면 모든 요청에 Bearer access token을
 * 붙이고, 401 응답 시 재발급 후 딱 1회 재시도한다.
 * 쿠키/세션은 쓰지 않으므로 credentials 옵션을 켜지 않는다 (기본 same-origin).
 */
export function createApiClient({ baseUrl, tokenProvider }: ApiClientOptions = {}): KyInstance {
  return ky.create({
    // ky v2 renamed `prefixUrl` to the web-standard `baseUrl`.
    baseUrl: baseUrl ?? process.env.NEXT_PUBLIC_API_URL ?? "/",
    retry: { limit: 2, methods: ["get"] },
    hooks: {
      beforeRequest: tokenProvider
        ? [
            async ({ request }) => {
              const token = await tokenProvider.getAccessToken();
              if (token) request.headers.set("Authorization", `Bearer ${token}`);
            },
          ]
        : [],
      afterResponse: tokenProvider
        ? [
            async ({ request, response }) => {
              if (response.status !== 401) return;
              const token = await tokenProvider.refreshAccessToken();
              if (!token) return; // 재발급 실패 — 401을 그대로 두면 아래 beforeError로 떨어진다.
              request.headers.set("Authorization", `Bearer ${token}`);
              // 인스턴스가 아닌 순정 ky로 재요청해야 이 훅이 다시 붙지 않는다(재시도 1회 보장).
              // throwHttpErrors:false — 여기서 받은 응답을 최종 응답으로 돌려주고,
              // 여전히 401이면 인스턴스 쪽 에러 처리로 일관되게 흘려보낸다.
              return ky(request, { throwHttpErrors: false });
            },
          ]
        : [],
      beforeError: [
        ({ error }) => {
          // Normalize so React Query / callers get a consistent message.
          // ky v2 passes a state object and expects the Error to be returned.
          error.name = "ApiError";
          return error;
        },
      ],
    },
  });
}

export const api = createApiClient();
