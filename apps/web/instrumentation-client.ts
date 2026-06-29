// 브라우저 측 Sentry 초기화. Next.js 15.3+ 가 이 파일을 자동 로드하며,
// 레거시 sentry.client.config.ts 를 대체한다.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 트레이스 샘플링: dev 100%, prod 10% — 트래픽에 맞춰 조정.
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1 : 0.1,

  // 구조화 로그를 Sentry 로 전송.
  enableLogs: true,

  // Session Replay 샘플링: 일반 세션 10%, 에러 발생 세션 100%.
  // Replay 통합 자체는 로드 후(아래 참고) 등록해 초기화가 아니라
  // 하이드레이션 이후에 셋업되도록 한다.
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,

  // dev 에서만 상세 SDK 로깅.
  debug: process.env.NODE_ENV === "development",
});

// 브라우저 idle 시점에 Session Replay 를 등록해 셋업이 초기 하이드레이션
// 이후에 실행되도록 한다. 런타임 작업만 지연될 뿐 — Replay 는 여전히
// @sentry/nextjs 에서 정적 import 되므로 번들 크기는 변하지 않는다.
if (typeof window !== "undefined") {
  const addReplay = () => Sentry.addIntegration(Sentry.replayIntegration());
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(addReplay, { timeout: 2000 });
  } else {
    setTimeout(addReplay, 2000);
  }
}

// App Router 클라이언트 내비게이션 계측.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
