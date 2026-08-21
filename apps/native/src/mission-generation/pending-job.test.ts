import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = vi.hoisted(() => new Map<string, string>());

vi.mock("expo-secure-store", () => ({
  deleteItemAsync: vi.fn(async (key: string) => {
    storage.delete(key);
  }),
  getItemAsync: vi.fn(async (key: string) => storage.get(key) ?? null),
  setItemAsync: vi.fn(async (key: string, value: string) => {
    storage.set(key, value);
  }),
}));

import * as SecureStore from "expo-secure-store";
import {
  clearPendingMissionGeneration,
  getPendingMissionGeneration,
  savePendingMissionGeneration,
} from "./pending-job";

describe("pending mission generation", () => {
  beforeEach(() => {
    storage.clear();
    vi.clearAllMocks();
  });

  it("대상 job이 현재 기록과 같을 때만 삭제한다", async () => {
    await savePendingMissionGeneration({ createdAt: 1, expiresAt: null, jobId: "job-new" });

    await clearPendingMissionGeneration("job-old");

    await expect(getPendingMissionGeneration()).resolves.toEqual({
      createdAt: 1,
      expiresAt: null,
      jobId: "job-new",
    });
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  it("대상 job이 현재 기록과 같으면 삭제한다", async () => {
    await savePendingMissionGeneration({ createdAt: 1, expiresAt: null, jobId: "job-1" });

    await clearPendingMissionGeneration("job-1");

    await expect(getPendingMissionGeneration()).resolves.toBeNull();
  });

  it("새 job 저장과 이전 job 삭제가 겹쳐도 새 기록을 유지한다", async () => {
    await savePendingMissionGeneration({ createdAt: 1, expiresAt: null, jobId: "job-old" });

    await Promise.all([
      savePendingMissionGeneration({ createdAt: 2, expiresAt: null, jobId: "job-new" }),
      clearPendingMissionGeneration("job-old"),
    ]);

    await expect(getPendingMissionGeneration()).resolves.toEqual({
      createdAt: 2,
      expiresAt: null,
      jobId: "job-new",
    });
  });
});
