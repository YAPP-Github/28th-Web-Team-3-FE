import type { GoalStatus } from "@repo/schema/goal";
import { useMutation, useQuery } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { reportGoalStatusError } from "@/lib/report-goal-status-error";
import { act, createTestQueryClient, renderHook, waitFor } from "@/lib/test/react";

vi.mock("@/api/goal", () => ({
  fetchGoalStatus: vi.fn(),
  updateGoal: vi.fn(),
  updateSavings: vi.fn(),
}));

vi.mock("@/lib/report-goal-status-error", () => ({
  reportGoalStatusError: vi.fn(),
}));

import { fetchGoalStatus, updateGoal, updateSavings } from "@/api/goal";
import { goalStatusOptions, updateGoalOptions, updateSavingsOptions } from "./goal";

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
  monthlySavings: [
    { yearMonth: "2026-07", savedManwon: 80, current: false },
    { yearMonth: "2026-08", savedManwon: 100, current: true },
  ],
};

const UPDATED_GOAL: GoalStatus = {
  ...STALE_GOAL,
  targetAmountManwon: 6000,
  periodMonths: 24,
};

const UPDATED_SAVINGS: GoalStatus = {
  ...STALE_GOAL,
  totalSavedManwon: 1983,
  progressPercent: 40,
  thisMonth: {
    ...STALE_GOAL.thisMonth,
    savedManwon: 133,
    progressPercent: 70,
  },
};

describe("goalStatusOptions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("최종 조회 실패를 한 번 보고하고 같은 오류를 다시 던진다", async () => {
    const error = new Error("goal request failed");
    vi.mocked(fetchGoalStatus).mockRejectedValue(error);

    const { result } = renderHook(() => useQuery(goalStatusOptions()));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
    expect(reportGoalStatusError).toHaveBeenCalledOnce();
    expect(reportGoalStatusError).toHaveBeenCalledWith(error);
  });
});

describe("updateSavingsOptions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("저축액 입력 응답으로 목표 현황 캐시를 갱신한다", async () => {
    vi.mocked(updateSavings).mockResolvedValue(STALE_GOAL);
    vi.mocked(fetchGoalStatus)
      .mockResolvedValueOnce(STALE_GOAL)
      .mockResolvedValueOnce(UPDATED_SAVINGS);
    const queryClient = createTestQueryClient();
    await queryClient.fetchQuery(goalStatusOptions());

    const { result } = renderHook(() => useMutation(updateSavingsOptions(queryClient)), {
      queryClient,
    });

    await act(async () => {
      await result.current.mutateAsync({ savedAmountManwon: 133 });
    });

    expect(queryClient.getQueryData(goalStatusOptions().queryKey)).toEqual(UPDATED_SAVINGS);
    expect(fetchGoalStatus).toHaveBeenCalledTimes(2);
  });

  it("저축액 입력 뒤 Goal v2 재조회가 실패하면 mutation도 실패한다", async () => {
    const error = new Error("goal refresh failed");
    vi.mocked(updateSavings).mockResolvedValue(STALE_GOAL);
    vi.mocked(fetchGoalStatus).mockResolvedValueOnce(STALE_GOAL).mockRejectedValueOnce(error);
    const queryClient = createTestQueryClient();
    await queryClient.fetchQuery(goalStatusOptions());

    const { result } = renderHook(() => useMutation(updateSavingsOptions(queryClient)), {
      queryClient,
    });

    await expect(act(() => result.current.mutateAsync({ savedAmountManwon: 133 }))).rejects.toBe(
      error,
    );
  });
});

describe("updateGoalOptions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("진행 중이던 조회가 늦게 끝나도 수정 뒤 재조회한 Goal v2를 유지한다", async () => {
    let resolveStaleGoal: (goal: GoalStatus) => void = () => {};
    let resolveFreshGoal: (goal: GoalStatus) => void = () => {};
    vi.mocked(fetchGoalStatus)
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveStaleGoal = resolve;
        }),
      )
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveFreshGoal = resolve;
        }),
      );
    vi.mocked(updateGoal).mockResolvedValue(STALE_GOAL);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(
      () => ({
        goal: useQuery(goalStatusOptions()),
        updateGoal: useMutation(updateGoalOptions(queryClient)),
      }),
      { queryClient },
    );
    await waitFor(() => expect(fetchGoalStatus).toHaveBeenCalledOnce());

    let mutation: Promise<unknown> = Promise.resolve();
    act(() => {
      mutation = result.current.updateGoal.mutateAsync({
        targetAmountManwon: 6000,
        periodMonths: 24,
      });
    });
    await waitFor(() => expect(fetchGoalStatus).toHaveBeenCalledTimes(2));

    resolveFreshGoal(UPDATED_GOAL);
    await act(async () => mutation);

    resolveStaleGoal(STALE_GOAL);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(queryClient.getQueryData(goalStatusOptions().queryKey)).toEqual(UPDATED_GOAL);
  });

  it("목표 수정 뒤 Goal v2를 다시 조회해 월별 현황을 갱신한다", async () => {
    vi.mocked(updateGoal).mockResolvedValue(STALE_GOAL);
    vi.mocked(fetchGoalStatus)
      .mockResolvedValueOnce(STALE_GOAL)
      .mockResolvedValueOnce(UPDATED_GOAL);
    const queryClient = createTestQueryClient();
    await queryClient.fetchQuery(goalStatusOptions());

    const { result } = renderHook(() => useMutation(updateGoalOptions(queryClient)), {
      queryClient,
    });

    await act(async () => {
      await result.current.mutateAsync({ targetAmountManwon: 6000, periodMonths: 24 });
    });

    expect(fetchGoalStatus).toHaveBeenCalledTimes(2);
    expect(queryClient.getQueryData(goalStatusOptions().queryKey)).toEqual(UPDATED_GOAL);
  });

  it("목표 수정 뒤 Goal v2 재조회가 실패하면 mutation도 실패한다", async () => {
    const error = new Error("goal refresh failed");
    vi.mocked(updateGoal).mockResolvedValue(STALE_GOAL);
    vi.mocked(fetchGoalStatus).mockResolvedValueOnce(STALE_GOAL).mockRejectedValueOnce(error);
    const queryClient = createTestQueryClient();
    await queryClient.fetchQuery(goalStatusOptions());

    const { result } = renderHook(() => useMutation(updateGoalOptions(queryClient)), {
      queryClient,
    });

    await expect(
      act(() => result.current.mutateAsync({ targetAmountManwon: 6000, periodMonths: 24 })),
    ).rejects.toBe(error);
  });
});
