import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ isNativeApp: vi.fn() }));

vi.mock("@repo/bridge", () => ({
  bridge: {},
  isNativeApp: mocks.isNativeApp,
}));

import { clearPendingMissionGeneration } from "./pending-mission-generation";

describe("clearPendingMissionGeneration", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mocks.isNativeApp.mockReturnValue(false);
  });

  it("다른 job의 보류 기록은 지우지 않는다", async () => {
    localStorage.setItem(
      "mission-generation:pending",
      JSON.stringify({ createdAt: 1, expiresAt: null, jobId: "job-new" }),
    );

    await clearPendingMissionGeneration("job-old");

    expect(localStorage.getItem("mission-generation:pending")).not.toBeNull();
  });

  it("같은 job의 보류 기록만 지운다", async () => {
    localStorage.setItem(
      "mission-generation:pending",
      JSON.stringify({ createdAt: 1, expiresAt: null, jobId: "job-1" }),
    );

    await clearPendingMissionGeneration("job-1");

    expect(localStorage.getItem("mission-generation:pending")).toBeNull();
  });
});
