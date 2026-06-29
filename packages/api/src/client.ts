import ky, { type KyInstance } from "ky";

/**
 * Shared HTTP client. `credentials: "include"` is required so the backend (Spring)
 * session cookie rides along — both in the browser and inside the native WebView
 * (where the cookie was injected before navigation).
 */
export function createApiClient(baseUrl?: string): KyInstance {
  return ky.create({
    // ky v2 renamed `prefixUrl` to the web-standard `baseUrl`.
    baseUrl: baseUrl ?? process.env.NEXT_PUBLIC_API_URL ?? "/",
    credentials: "include",
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
