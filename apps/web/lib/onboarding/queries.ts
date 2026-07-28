import type { OnboardingGoalConfirm, OnboardingProfilePatch } from "@repo/schema/onboarding-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  confirmOnboardingGoal,
  getOnboardingGoalPlans,
  getOnboardingProfile,
  getOnboardingReport,
  patchOnboardingProfile,
} from "@/lib/onboarding/api";

export const ONBOARDING_PROFILE_QUERY_KEY = ["onboarding", "profile"] as const;
const ONBOARDING_REPORT_QUERY_KEY = ["onboarding", "report"] as const;
const ONBOARDING_GOAL_PLANS_QUERY_KEY = ["onboarding", "goal-plans"] as const;

/**
 * 온보딩 프로필 조회. 홈의 온보딩 완료 판정, 질문 퍼널의 초기값 복원, 목표 수정
 * 시트의 기간·월소득이 모두 이 하나를 본다 — 훅으로 묶어야 화면마다 따로 요청하지 않는다.
 */
export function useOnboardingProfile() {
  return useQuery({
    queryKey: ONBOARDING_PROFILE_QUERY_KEY,
    queryFn: getOnboardingProfile,
  });
}

/** 온보딩 결과 리포트 조회. */
export function useOnboardingReport() {
  return useQuery({
    queryKey: ONBOARDING_REPORT_QUERY_KEY,
    queryFn: getOnboardingReport,
  });
}

/** 목표 플랜 후보 조회. */
export function useOnboardingGoalPlans() {
  return useQuery({
    queryKey: ONBOARDING_GOAL_PLANS_QUERY_KEY,
    queryFn: getOnboardingGoalPlans,
  });
}

/** 프로필 부분 저장 — 성공하면 프로필 캐시를 갱신해 다른 화면이 최신값을 본다. */
export function usePatchOnboardingProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profile: OnboardingProfilePatch) => patchOnboardingProfile(profile),
    onSuccess: (profile) => queryClient.setQueryData(ONBOARDING_PROFILE_QUERY_KEY, profile),
  });
}

/**
 * 목표 플랜 확정.
 * react-query는 mutationFn에 (variables, context) 두 인자를 넘기므로 함수를 그대로
 * 넘기지 않고 감싼다 — 안 그러면 API 함수가 쓰지도 않는 context까지 받는다.
 */
export function useConfirmOnboardingGoal() {
  return useMutation({
    mutationFn: (goal: OnboardingGoalConfirm) => confirmOnboardingGoal(goal),
  });
}
