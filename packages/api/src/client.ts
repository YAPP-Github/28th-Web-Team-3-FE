import ky, { type KyInstance } from "ky";

/**
 * Shared HTTP client. `credentials: "include"` is required so the Better Auth
 * session cookie rides along — both in the browser and inside the native WebView
 * (where the cookie was injected before navigation).
 */
export function createApiClient(prefixUrl?: string): KyInstance {
  return ky.create({
    prefixUrl: prefixUrl ?? process.env.NEXT_PUBLIC_API_URL ?? "/",
    credentials: "include",
    retry: { limit: 2, methods: ["get"] },
    hooks: {
      beforeError: [
        (error) => {
          // Normalize so React Query / callers get a consistent message.
          error.name = "ApiError";
          return error;
        },
      ],
    },
  });
}

export const api = createApiClient();
