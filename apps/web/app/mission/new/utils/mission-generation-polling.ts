"use client";

import { bridge, isNativeApp } from "@repo/bridge";
import {
  type MissionGenerationJob,
  missionGenerationJobSchema,
} from "@repo/schema/mission-generation";

const DEFAULT_POLLING_INTERVAL_MS = 3_000;
const MAX_POLLING_INTERVAL_MS = 5_000;
const MIN_POLLING_INTERVAL_MS = 2_000;

export function getPollingIntervalMillis(serverInterval?: number): number {
  const interval = serverInterval ?? DEFAULT_POLLING_INTERVAL_MS;
  return Math.min(MAX_POLLING_INTERVAL_MS, Math.max(MIN_POLLING_INTERVAL_MS, interval));
}

export function supportsMissionGenerationWorker(): boolean {
  return (
    isNativeApp() &&
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    typeof process.env.NEXT_PUBLIC_API_URL === "string"
  );
}

type PollMessage =
  | { attemptCount: number; durationMs: number; job: MissionGenerationJob; type: "status" }
  | { durationMs?: number; reason: "network" | "unauthorized"; type: "error" };

export async function startMissionGenerationWorkerPolling({
  jobId,
  onMessage,
  pollingIntervalMillis,
}: {
  jobId: string;
  onMessage: (message: PollMessage) => void;
  pollingIntervalMillis?: number;
}): Promise<(() => void) | null> {
  if (!supportsMissionGenerationWorker()) return null;
  const accessToken = await bridge.getAccessToken().catch(() => null);
  if (!accessToken) return null;

  await navigator.serviceWorker.register("/mission-generation-polling-worker.js");
  const registration = await navigator.serviceWorker.ready;
  const worker = registration.active;
  if (!worker) return null;
  const statusUrl = new URL(
    `missions/generation-jobs/${jobId}`,
    process.env.NEXT_PUBLIC_API_URL,
  ).toString();
  const handleMessage = (event: MessageEvent) => {
    const data = event.data;
    if (data?.jobId && data.jobId !== jobId) return;
    if (data?.type === "mission-generation-poll-status") {
      const parsed = missionGenerationJobSchema.safeParse(data.job);
      if (parsed.success) {
        onMessage({
          attemptCount: Number(data.attemptCount) || 0,
          durationMs: Number(data.durationMs) || 0,
          job: parsed.data,
          type: "status",
        });
      }
    }
    if (data?.type === "mission-generation-poll-error") {
      onMessage({ durationMs: data.durationMs, reason: data.reason, type: "error" });
    }
  };
  navigator.serviceWorker.addEventListener("message", handleMessage);
  worker.postMessage({
    accessToken,
    intervalMs: getPollingIntervalMillis(pollingIntervalMillis),
    jobId,
    statusUrl,
    type: "mission-generation-poll-start",
  });
  return () => {
    navigator.serviceWorker.removeEventListener("message", handleMessage);
  };
}

export function stopMissionGenerationWorkerPolling(jobId: string) {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  void navigator.serviceWorker.getRegistration().then((registration) => {
    registration?.active?.postMessage({ jobId, type: "mission-generation-poll-stop" });
  });
}
