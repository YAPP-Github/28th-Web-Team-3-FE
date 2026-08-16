import type { CurrentUser } from "@repo/schema/auth";
import type { GoalStatus } from "@repo/schema/goal";
import type { OnboardingProfile } from "@repo/schema/onboarding-api";
import { useMutation } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, createTestQueryClient, renderHook } from "@/lib/test/react";

const { ALREADY_COMPLETED_ERROR } = vi.hoisted(() => ({
  ALREADY_COMPLETED_ERROR: new Error("ONBOARDING_ALREADY_COMPLETED"),
}));

vi.mock("@/api/onboarding", () => ({
  confirmOnboardingGoal: vi.fn(),
  getOnboardingGoalPlans: vi.fn(),
  getOnboardingProfile: vi.fn(),
  getOnboardingReport: vi.fn(),
  isOnboardingAlreadyCompletedError: (error: unknown) => error === ALREADY_COMPLETED_ERROR,
  patchOnboardingProfile: vi.fn(),
  updateOnboardingProfile: vi.fn(),
}));

vi.mock("@/api/goal", () => ({
  fetchGoalStatus: vi.fn(),
  updateGoal: vi.fn(),
  updateSavings: vi.fn(),
}));

import { fetchGoalStatus } from "@/api/goal";
import { confirmOnboardingGoal, updateOnboardingProfile } from "@/api/onboarding";
import { currentUserOptions } from "@/lib/queries/auth";
import { goalStatusOptions } from "@/lib/queries/goal";
import {
  confirmOnboardingGoalOptions,
  onboardingProfileOptions,
  updateOnboardingProfileOptions,
} from "./onboarding";

const IN_PROGRESS_PROFILE: OnboardingProfile = {
  status: "IN_PROGRESS",
  birthDate: "1998-03-01",
  address: "SEOUL",
  monthlySalaryManwon: 300,
  monthlySavingManwon: 100,
  netWorthManwon: 1000,
  goalPeriodMonths: 24,
};

const INCOMPLETE_CURRENT_USER: CurrentUser = { userId: 1, onboardingCompleted: false };

describe("confirmOnboardingGoalOptions", () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * 확정 직후 홈으로 replace하는데, 온보딩 레이아웃이 심어둔 IN_PROGRESS가 캐시에
   * 남아 있으면 홈이 그 값을 읽고 온보딩으로 되돌려 보낸다.
   */
  it("목표를 확정하면 프로필 캐시의 status를 COMPLETED로 올린다", async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(onboardingProfileOptions().queryKey, IN_PROGRESS_PROFILE);
    queryClient.setQueryData(currentUserOptions().queryKey, INCOMPLETE_CURRENT_USER);
    vi.mocked(confirmOnboardingGoal).mockResolvedValue({
      goalId: 1,
      periodMonths: 12,
      targetAmountManwon: 1440,
      status: "COMPLETED",
    });

    const { result } = renderHook(() => useMutation(confirmOnboardingGoalOptions(queryClient)), {
      queryClient,
    });
    await act(async () => {
      await result.current.mutateAsync({ monthlySavingManwon: 115 });
    });

    expect(queryClient.getQueryData(onboardingProfileOptions().queryKey)).toEqual({
      ...IN_PROGRESS_PROFILE,
      status: "COMPLETED",
    });
    expect(queryClient.getQueryData(currentUserOptions().queryKey)).toEqual({
      ...INCOMPLETE_CURRENT_USER,
      onboardingCompleted: true,
    });
  });

  it("프로필을 아직 조회하지 않았으면 캐시를 만들어내지 않는다", async () => {
    const queryClient = createTestQueryClient();
    vi.mocked(confirmOnboardingGoal).mockResolvedValue({
      goalId: 1,
      periodMonths: 12,
      targetAmountManwon: 1440,
      status: "COMPLETED",
    });

    const { result } = renderHook(() => useMutation(confirmOnboardingGoalOptions(queryClient)), {
      queryClient,
    });
    await act(async () => {
      await result.current.mutateAsync({ monthlySavingManwon: 115 });
    });

    expect(queryClient.getQueryData(onboardingProfileOptions().queryKey)).toBeUndefined();
  });

  it("서버에 이미 완료된 재시도도 완료 캐시로 복구한다", async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryDefaults(onboardingProfileOptions().queryKey, {
      gcTime: Number.POSITIVE_INFINITY,
    });
    queryClient.setQueryDefaults(currentUserOptions().queryKey, {
      gcTime: Number.POSITIVE_INFINITY,
    });
    queryClient.setQueryData(onboardingProfileOptions().queryKey, IN_PROGRESS_PROFILE);
    queryClient.setQueryData(currentUserOptions().queryKey, INCOMPLETE_CURRENT_USER);
    vi.mocked(confirmOnboardingGoal).mockRejectedValue(ALREADY_COMPLETED_ERROR);

    const { result } = renderHook(() => useMutation(confirmOnboardingGoalOptions(queryClient)), {
      queryClient,
    });
    await act(async () => {
      await expect(result.current.mutateAsync({ monthlySavingManwon: 115 })).rejects.toBe(
        ALREADY_COMPLETED_ERROR,
      );
    });

    expect(queryClient.getQueryData(onboardingProfileOptions().queryKey)).toEqual({
      ...IN_PROGRESS_PROFILE,
      status: "COMPLETED",
    });
    expect(queryClient.getQueryData(currentUserOptions().queryKey)).toEqual({
      ...INCOMPLETE_CURRENT_USER,
      onboardingCompleted: true,
    });
  });
});

describe("updateOnboardingProfileOptions", () => {
  const COMPLETED_PROFILE: OnboardingProfile = { ...IN_PROGRESS_PROFILE, status: "COMPLETED" };
  const GOAL: GoalStatus = {
    targetAmountManwon: 5000,
    periodMonths: 24,
    totalSavedManwon: 1950,
    progressPercent: 39,
    usageMonths: 8,
    deadlineDDay: 486,
    thisMonth: { targetManwon: 82, savedManwon: 67, progressPercent: 82, dDay: 12 },
    monthlySavings: [{ yearMonth: "2026-08", savedManwon: 67, current: true }],
  };

  beforeEach(() => vi.clearAllMocks());

  /**
   * 목표 총 저축액은 "온보딩 순자산 + 누적 저축"이라 순자산만 고쳐도 서버 값이 달라진다.
   * 목표 캐시는 staleTime이 60초라, 무효화하지 않으면 저장 직후 돌아온 화면이 옛 값을 보여준다.
   */
  it("프로필을 저장하면 목표 현황 캐시를 무효화한다", async () => {
    vi.mocked(updateOnboardingProfile).mockResolvedValue(COMPLETED_PROFILE);
    vi.mocked(fetchGoalStatus).mockResolvedValue(GOAL);
    const queryClient = createTestQueryClient();
    // 테스트 클라이언트는 gcTime이 0이라 관찰자 없는 쿼리가 즉시 사라진다.
    queryClient.setQueryDefaults(goalStatusOptions().queryKey, {
      gcTime: Number.POSITIVE_INFINITY,
    });
    await queryClient.fetchQuery(goalStatusOptions());
    expect(queryClient.getQueryState(goalStatusOptions().queryKey)?.isInvalidated).toBe(false);

    const { result } = renderHook(() => useMutation(updateOnboardingProfileOptions(queryClient)), {
      queryClient,
    });
    await act(async () => {
      await result.current.mutateAsync({ netWorthManwon: 2500 });
    });

    // 목표 화면을 벗어나 있어 관찰자가 없다 — 무효화만 해두면 돌아갈 때 다시 조회한다.
    expect(queryClient.getQueryState(goalStatusOptions().queryKey)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryData(onboardingProfileOptions().queryKey)).toEqual(
      COMPLETED_PROFILE,
    );
  });
});
