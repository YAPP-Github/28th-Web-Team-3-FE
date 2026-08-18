"use client";

export type MissionGenerationPollingSource = "page" | "service-worker";

/**
 * DevTools Performance와 `mission-generation-poll-metric` CustomEvent로 같은 데이터를 남긴다.
 * 분석 SDK를 붙일 때는 이 이벤트를 구독하면 요청 수·시간을 두 폴링 경로별로 보낼 수 있다.
 */
export function recordMissionGenerationPollMetric({
  durationMs,
  source,
}: {
  durationMs: number;
  source: MissionGenerationPollingSource;
}) {
  if (typeof window === "undefined" || !Number.isFinite(durationMs) || durationMs < 0) return;

  // duration만 넘기면 Android WebView는 시작·종료 시점이 모호하다며 예외를 던진다.
  // 성능 기록 실패가 서비스워커의 job 상태 메시지 처리까지 끊으면 안 된다.
  try {
    performance.measure(`mission-generation-poll:${source}`, {
      duration: durationMs,
      start: Math.max(0, performance.now() - durationMs),
    });
  } catch {}

  window.dispatchEvent(
    new CustomEvent("mission-generation-poll-metric", { detail: { durationMs, source } }),
  );
}
