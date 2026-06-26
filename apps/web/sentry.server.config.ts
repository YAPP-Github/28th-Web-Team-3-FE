// Server (Node.js runtime) Sentry init. Loaded via instrumentation.ts.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === "development" ? 1 : 0.1,

  enableLogs: true,

  // Verbose SDK logging in dev only.
  debug: process.env.NODE_ENV === "development",
});
