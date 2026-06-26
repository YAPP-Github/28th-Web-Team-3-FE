// Browser-side Sentry init. Next.js 15.3+ loads this automatically; replaces
// the legacy sentry.client.config.ts.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 100% traces in dev, 10% in prod — tune to traffic.
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1 : 0.1,

  // Send structured logs to Sentry.
  enableLogs: true,

  // Session Replay: 10% of normal sessions, 100% of sessions with an error.
  integrations: [Sentry.replayIntegration()],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,

  // Verbose SDK logging in dev only.
  debug: process.env.NODE_ENV === "development",
});

// Instrument App Router client-side navigations.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
