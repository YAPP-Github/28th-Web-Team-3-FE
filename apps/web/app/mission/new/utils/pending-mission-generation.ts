"use client";

import type { PendingMissionGeneration } from "@repo/bridge";
import { bridge, isNativeApp } from "@repo/bridge";

const STORAGE_KEY = "mission-generation:pending";
const clearedJobIds = new Set<string>();

export async function savePendingMissionGeneration(job: PendingMissionGeneration) {
  if (isNativeApp()) {
    await bridge.savePendingMissionGeneration(job).catch(() => {});
    // 로딩 전환을 저장 완료보다 먼저 하므로, 생성 결과가 아주 빨리 도착해 이미 지운 job이
    // 뒤늦게 SecureStore에 다시 기록될 수 있다. 이 경우 저장 직후 한 번 더 지운다.
    if (clearedJobIds.has(job.jobId)) {
      await bridge.clearPendingMissionGeneration(job.jobId).catch(() => {});
    }
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(job));
  if (clearedJobIds.has(job.jobId)) localStorage.removeItem(STORAGE_KEY);
}

export async function clearPendingMissionGeneration(jobId?: string) {
  if (jobId) clearedJobIds.add(jobId);
  if (isNativeApp()) {
    await bridge.clearPendingMissionGeneration(jobId).catch(() => {});
    return;
  }
  if (jobId === undefined) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  const storedJob = localStorage.getItem(STORAGE_KEY);
  if (!storedJob) return;
  try {
    if ((JSON.parse(storedJob) as PendingMissionGeneration).jobId === jobId) {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}
