import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getMissionCreationStartDate,
  hasStartedMissionCreation,
  markMissionCreationStarted,
} from "./mission-creation-history";

describe("mission creation history", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns false when browser storage cannot be read", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });

    await expect(hasStartedMissionCreation()).resolves.toBe(false);
  });

  it("ignores browser storage write failures", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });

    await expect(markMissionCreationStarted()).resolves.toBeUndefined();
  });

  it("preserves and returns the first creation date", async () => {
    localStorage.setItem("mission-creation:started", "2026-08-01");

    await markMissionCreationStarted();

    await expect(getMissionCreationStartDate()).resolves.toBe("2026-08-01");
  });
});
