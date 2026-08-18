import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = vi.hoisted(() => new Map<string, string>());

vi.mock("expo-secure-store", () => ({
  getItemAsync: vi.fn(async (key: string) => storage.get(key) ?? null),
  setItemAsync: vi.fn(async (key: string, value: string) => {
    storage.set(key, value);
  }),
}));

import * as SecureStore from "expo-secure-store";
import { hasStartedMissionCreation, markMissionCreationStarted } from "./history";

describe("mission creation history", () => {
  beforeEach(() => {
    storage.clear();
    vi.clearAllMocks();
  });

  it("생성 시작 이력이 없으면 false를 반환한다", async () => {
    await expect(hasStartedMissionCreation()).resolves.toBe(false);
  });

  it("생성 시작을 기록하면 이후 이력을 반환한다", async () => {
    await markMissionCreationStarted();

    await expect(hasStartedMissionCreation()).resolves.toBe(true);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith("mission_creation_started", "true");
  });
});
