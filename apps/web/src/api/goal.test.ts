import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/client", () => ({
  http: { get: vi.fn(), patch: vi.fn(), put: vi.fn() },
}));

import { http } from "@/api/client";
import { fetchGoalStatus, updateGoal, updateSavings } from "./goal";

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

  it("월별 저축 현황이 포함된 Goal v2를 조회한다", async () => {
    vi.mocked(http.get).mockReturnValue(Promise.resolve(UPDATED_GOAL) as never);

    await fetchGoalStatus();

    expect(http.get).toHaveBeenCalledWith(
      "v2/goal",
      expect.objectContaining({ response: expect.anything() }),
    );
  });

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
