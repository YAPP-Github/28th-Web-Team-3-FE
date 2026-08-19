"use client";

import { bridge, isNativeApp } from "@repo/bridge";

const STORAGE_KEY = "mission-creation:started";

function getSeoulDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Seoul",
    year: "numeric",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;

  return `${value("year")}-${value("month")}-${value("day")}`;
}

export async function hasStartedMissionCreation(): Promise<boolean> {
  if (isNativeApp()) return bridge.hasStartedMissionCreation().catch(() => false);
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export async function getMissionCreationStartDate(): Promise<string | null> {
  if (isNativeApp()) return bridge.getMissionCreationStartDate().catch(() => null);
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "true" ? null : value;
  } catch {
    return null;
  }
}

export async function markMissionCreationStarted(): Promise<void> {
  if (isNativeApp()) {
    await bridge.markMissionCreationStarted().catch(() => {});
    return;
  }
  try {
    if (localStorage.getItem(STORAGE_KEY)) return;
    localStorage.setItem(STORAGE_KEY, getSeoulDate());
  } catch {}
}
