import type { PendingMissionGeneration } from "@repo/bridge/types";
import * as SecureStore from "expo-secure-store";

const PENDING_MISSION_GENERATION_KEY = "pending_mission_generation";

export async function savePendingMissionGeneration(job: PendingMissionGeneration): Promise<void> {
  await SecureStore.setItemAsync(PENDING_MISSION_GENERATION_KEY, JSON.stringify(job));
}

export async function getPendingMissionGeneration(): Promise<PendingMissionGeneration | null> {
  const stored = await SecureStore.getItemAsync(PENDING_MISSION_GENERATION_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as Partial<PendingMissionGeneration>;
    if (
      typeof parsed.jobId !== "string" ||
      typeof parsed.createdAt !== "number" ||
      (parsed.expiresAt !== null && typeof parsed.expiresAt !== "string")
    ) {
      return null;
    }
    return { createdAt: parsed.createdAt, expiresAt: parsed.expiresAt, jobId: parsed.jobId };
  } catch {
    return null;
  }
}

export function clearPendingMissionGeneration(): Promise<void> {
  return SecureStore.deleteItemAsync(PENDING_MISSION_GENERATION_KEY);
}
