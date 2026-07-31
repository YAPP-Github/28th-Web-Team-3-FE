import ky, { type KyInstance } from "ky";

/**
 * 토큰 공급자. access token은 네이티브(RN) 메모리에 있고 웹은 bridge로 받아 온다.
 * 공급자가 없으면(일반 브라우저, 서버) 헤더 없이 보낸다.
 */
export type TokenProvider = {
  /** 현재 access token. null이면 Authorization 헤더를 붙이지 않는다. */
  getAccessToken(): Promise<string | null>;
  /** 401 이후 재발급. 실패하면 null을 돌려주고 401은 그대로 나간다. */
  refreshAccessToken(): Promise<string | null>;
};

export type ApiClientOptions = {
  baseUrl?: string;
  tokenProvider?: TokenProvider;
};

/** 끝 슬래시가 없으면 마지막 경로 조각이 잘린다: `.../api` + `goal` → `.../goal`. */
function normalizeBaseUrl(baseUrl?: string) {
  const resolved = baseUrl ?? process.env.NEXT_PUBLIC_API_URL ?? "/";
  return resolved.endsWith("/") ? resolved : `${resolved}/`;
}

/**
 * 전송 계층. baseUrl과 인증 헤더, 재시도, 에러 이름을 맡는다. 요청·응답 스키마 검증은
 * 이 인스턴스를 감싸는 `./http.ts`가 한다. 쿠키를 쓰지 않으니 credentials는 켜지 않는다.
 */
export function createApiClient({ baseUrl, tokenProvider }: ApiClientOptions = {}): KyInstance {
  return ky.create({
    baseUrl: normalizeBaseUrl(baseUrl),
    // 재시도는 여기서만 한다. react-query(`./query-client.tsx`)에서도 켜면 두 레이어가
    // 곱해져 GET 한 번이 최대 6요청이 된다.
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
              // 재발급 실패. 401을 그대로 흘려보내 beforeError로 넘긴다.
              if (!accessToken) return;
              request.headers.set("Authorization", `Bearer ${accessToken}`);
              // 순정 ky로 보낸다. 인스턴스로 보내면 이 훅이 다시 붙어 401과 재발급이 무한
              // 반복된다. throwHttpErrors를 끄면 이 응답이 그대로 최종 결과가 되고, 여전히
              // 401이면 아래 beforeError로 간다.
              return ky(request, { throwHttpErrors: false, retry: { limit: 0 } });
            },
          ]
        : [],
      beforeError: [
        ({ error }) => {
          // 로그와 Sentry에서 이 클라이언트의 에러를 한 이름으로 묶는다. 분기가 필요하면
          // 호출부가 HTTPError와 error.data를 본다.
          error.name = "ApiError";
          // ky v2는 state 객체를 넘기고 수정한 Error를 돌려받는다.
          return error;
        },
      ],
    },
  });
}
