"use client";

import { bridge, isNativeApp } from "@repo/bridge";

const STORAGE_KEY = "mission-creation:started";

export async function hasStartedMissionCreation(): Promise<boolean> {
  if (isNativeApp()) return bridge.hasStartedMissionCreation().catch(() => false);
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export async function markMissionCreationStarted(): Promise<void> {
  if (isNativeApp()) {
    await bridge.markMissionCreationStarted().catch(() => {});
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch {}
}
