import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NODE_ENV === "development") {
    return;
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// 중첩된 React Server Component에서 난 에러를 잡는다.
export const onRequestError =
  process.env.NODE_ENV === "development" ? () => {} : Sentry.captureRequestError;
