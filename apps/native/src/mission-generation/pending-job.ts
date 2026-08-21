import type { PendingMissionGeneration } from "@repo/bridge/types";
import * as SecureStore from "expo-secure-store";

const PENDING_MISSION_GENERATION_KEY = "pending_mission_generation";
let pendingOperation = Promise.resolve();

function serializePendingOperation<T>(operation: () => Promise<T>): Promise<T> {
  const result = pendingOperation.then(operation, operation);
  pendingOperation = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

async function readPendingMissionGeneration(): Promise<PendingMissionGeneration | null> {
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

export function savePendingMissionGeneration(job: PendingMissionGeneration): Promise<void> {
  return serializePendingOperation(() =>
    SecureStore.setItemAsync(PENDING_MISSION_GENERATION_KEY, JSON.stringify(job)),
  );
}

export function getPendingMissionGeneration(): Promise<PendingMissionGeneration | null> {
  return serializePendingOperation(readPendingMissionGeneration);
}

export function clearPendingMissionGeneration(jobId?: string): Promise<void> {
  return serializePendingOperation(async () => {
    if (jobId) {
      const pendingJob = await readPendingMissionGeneration();
      if (pendingJob?.jobId !== jobId) return;
    }
    await SecureStore.deleteItemAsync(PENDING_MISSION_GENERATION_KEY);
  });
}
