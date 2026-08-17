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
  if (typeof window === "undefined" || !Number.isFinite(durationMs)) return;
  performance.measure(`mission-generation-poll:${source}`, { duration: durationMs });
  window.dispatchEvent(
    new CustomEvent("mission-generation-poll-metric", { detail: { durationMs, source } }),
  );
}
