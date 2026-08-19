import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const storage = vi.hoisted(() => new Map<string, string>());

vi.mock("expo-secure-store", () => ({
  getItemAsync: vi.fn(async (key: string) => storage.get(key) ?? null),
  setItemAsync: vi.fn(async (key: string, value: string) => {
    storage.set(key, value);
  }),
}));

import * as SecureStore from "expo-secure-store";
import {
  getMissionCreationStartDate,
  hasStartedMissionCreation,
  markMissionCreationStarted,
} from "./history";

describe("mission creation history", () => {
  beforeEach(() => {
    storage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("생성 시작 이력이 없으면 false를 반환한다", async () => {
    await expect(hasStartedMissionCreation()).resolves.toBe(false);
  });

  it("생성 시작을 기록하면 이후 이력을 반환한다", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-19T00:00:00.000Z"));
    await markMissionCreationStarted();

    await expect(hasStartedMissionCreation()).resolves.toBe(true);
    await expect(getMissionCreationStartDate()).resolves.toBe("2026-08-19");
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith("mission_creation_started", "2026-08-19");
  });

  it("기존 생성일을 덮어쓰지 않는다", async () => {
    storage.set("mission_creation_started", "2026-08-01");

    await markMissionCreationStarted();

    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });
});
