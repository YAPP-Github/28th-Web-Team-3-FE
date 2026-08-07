import type { GoalStatus } from "@repo/schema/goal";
import { useMutation, useQuery } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, createTestQueryClient, renderHook, waitFor } from "@/lib/test/react";

vi.mock("@/api/goal", () => ({
  fetchGoalStatus: vi.fn(),
  updateGoal: vi.fn(),
  updateSavings: vi.fn(),
}));

import { fetchGoalStatus, updateGoal } from "@/api/goal";
import { goalStatusOptions, updateGoalOptions } from "./goal";

const STALE_GOAL: GoalStatus = {
  targetAmountManwon: 5000,
  periodMonths: 16,
  totalSavedManwon: 1950,
  progressPercent: 39,
  usageMonths: 8,
  deadlineDDay: 240,
  thisMonth: {
    targetManwon: 190,
    savedManwon: 100,
    progressPercent: 53,
    dDay: 12,
  },
};

const UPDATED_GOAL: GoalStatus = {
  ...STALE_GOAL,
  targetAmountManwon: 6000,
  periodMonths: 24,
};

describe("updateGoalOptions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("진행 중이던 조회가 늦게 끝나도 수정 응답 캐시를 유지한다", async () => {
    let resolveStaleGoal: (goal: GoalStatus) => void = () => {};
    vi.mocked(fetchGoalStatus).mockReturnValue(
      new Promise((resolve) => {
        resolveStaleGoal = resolve;
      }),
    );
    vi.mocked(updateGoal).mockResolvedValue(UPDATED_GOAL);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(
      () => ({
        goal: useQuery(goalStatusOptions()),
        updateGoal: useMutation(updateGoalOptions(queryClient)),
      }),
      { queryClient },
    );
    await waitFor(() => expect(fetchGoalStatus).toHaveBeenCalledOnce());

    await act(async () => {
      await result.current.updateGoal.mutateAsync({
        targetAmountManwon: 6000,
        periodMonths: 24,
      });
    });

    expect(queryClient.getQueryData(goalStatusOptions().queryKey)).toEqual(UPDATED_GOAL);

    resolveStaleGoal(STALE_GOAL);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(queryClient.getQueryData(goalStatusOptions().queryKey)).toEqual(UPDATED_GOAL);
  });
});
