"use client";

import type { PendingMissionGeneration } from "@repo/bridge";
import { bridge, isNativeApp } from "@repo/bridge";

const STORAGE_KEY = "mission-generation:pending";

export async function savePendingMissionGeneration(job: PendingMissionGeneration) {
  if (isNativeApp()) {
    await bridge.savePendingMissionGeneration(job).catch(() => {});
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(job));
}

export async function clearPendingMissionGeneration() {
  if (isNativeApp()) {
    await bridge.clearPendingMissionGeneration().catch(() => {});
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
}
