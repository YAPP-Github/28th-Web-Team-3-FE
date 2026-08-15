import type { CurrentUser } from "@repo/schema/auth";
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
}));

import { confirmOnboardingGoal } from "@/api/onboarding";
import { currentUserOptions } from "@/lib/queries/auth";
import { confirmOnboardingGoalOptions, onboardingProfileOptions } from "./onboarding";

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
