// 서버(Node.js 런타임) Sentry 초기화. instrumentation.ts가 불러온다.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === "development" ? 1 : 0.1,

  enableLogs: true,

  // dev에서만 SDK 로그를 자세히 남긴다.
  debug: process.env.NODE_ENV === "development",
});
