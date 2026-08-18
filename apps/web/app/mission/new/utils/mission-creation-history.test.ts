import { afterEach, describe, expect, it, vi } from "vitest";
import { hasStartedMissionCreation, markMissionCreationStarted } from "./mission-creation-history";

describe("mission creation history", () => {
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
});
