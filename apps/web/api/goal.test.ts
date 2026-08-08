import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/client", () => ({
  http: { get: vi.fn(), patch: vi.fn(), put: vi.fn() },
}));

import { http } from "@/api/client";
import { updateGoal, updateSavings } from "./goal";

const UPDATED_GOAL = {
  targetAmountManwon: 6000,
  periodMonths: 24,
  totalSavedManwon: 1950,
  progressPercent: 33,
  usageMonths: 8,
  deadlineDDay: 480,
  thisMonth: {
    targetManwon: 169,
    savedManwon: 100,
    progressPercent: 59,
    dDay: 12,
  },
};

describe("goal API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("목표 수정 요청과 응답 계약을 함께 검증한다", async () => {
    vi.mocked(http.patch).mockReturnValue(Promise.resolve(UPDATED_GOAL) as never);
    const body = { targetAmountManwon: 6000, periodMonths: 24 };

    await expect(updateGoal(body)).resolves.toEqual(UPDATED_GOAL);

    expect(http.patch).toHaveBeenCalledWith(
      "goal",
      expect.objectContaining({
        body,
        request: expect.anything(),
        response: expect.anything(),
      }),
    );
  });

  it("이번 달 저축액 입력 후 갱신된 목표 현황을 검증한다", async () => {
    vi.mocked(http.put).mockReturnValue(Promise.resolve(UPDATED_GOAL) as never);
    const body = { savedAmountManwon: 100 };

    await expect(updateSavings(body)).resolves.toEqual(UPDATED_GOAL);

    expect(http.put).toHaveBeenCalledWith(
      "goal/savings",
      expect.objectContaining({
        body,
        request: expect.anything(),
        response: expect.anything(),
      }),
    );
  });
});
