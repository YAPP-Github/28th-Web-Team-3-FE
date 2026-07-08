import ky, { type KyInstance } from "ky";

/**
 * Shared HTTP client. 인증은 비로그인 게스트 JWT(Authorization: Bearer) 전제 —
 * 쿠키/세션을 쓰지 않으므로 credentials 옵션을 켜지 않는다 (기본 same-origin).
 */
export function createApiClient(baseUrl?: string): KyInstance {
  return ky.create({
    // ky v2 renamed `prefixUrl` to the web-standard `baseUrl`.
    baseUrl: baseUrl ?? process.env.NEXT_PUBLIC_API_URL ?? "/",
    retry: { limit: 2, methods: ["get"] },
    hooks: {
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
