import type {
  OnboardingGoalConfirm,
  OnboardingProfile,
  OnboardingProfilePatch,
} from "@repo/schema/onboarding-api";
import { mutationOptions, type QueryClient, queryOptions } from "@tanstack/react-query";
import {
  confirmOnboardingGoal,
  getOnboardingGoalPlans,
  getOnboardingProfile,
  getOnboardingReport,
  patchOnboardingProfile,
} from "@/api/onboarding";

export const ONBOARDING_PROFILE_QUERY_KEY = ["onboarding", "profile"] as const;
const ONBOARDING_REPORT_QUERY_KEY = ["onboarding", "report"] as const;
const ONBOARDING_GOAL_PLANS_QUERY_KEY = ["onboarding", "goal-plans"] as const;

/**
 * 온보딩 프로필 조회. 홈의 온보딩 완료 판정, 질문 퍼널의 초기값 복원, 목표 수정
 * 시트의 기간·월소득이 모두 이 하나를 본다 — 같은 queryKey를 공유해 화면마다 따로 요청하지 않는다.
 */
export function onboardingProfileOptions() {
  return queryOptions({
    queryKey: ONBOARDING_PROFILE_QUERY_KEY,
    queryFn: getOnboardingProfile,
  });
}

/** 온보딩 결과 리포트 조회. */
export function onboardingReportOptions() {
  return queryOptions({
    queryKey: ONBOARDING_REPORT_QUERY_KEY,
    queryFn: getOnboardingReport,
  });
}

/** 목표 플랜 후보 조회. */
export function onboardingGoalPlansOptions() {
  return queryOptions({
    queryKey: ONBOARDING_GOAL_PLANS_QUERY_KEY,
    queryFn: getOnboardingGoalPlans,
  });
}

/** 프로필 부분 저장 — 성공하면 프로필 캐시를 갱신해 다른 화면이 최신값을 본다. */
export function patchOnboardingProfileOptions(queryClient: QueryClient) {
  return mutationOptions({
    mutationFn: (profile: OnboardingProfilePatch) => patchOnboardingProfile(profile),
    onSuccess: (profile) => queryClient.setQueryData(ONBOARDING_PROFILE_QUERY_KEY, profile),
  });
}

/**
 * 목표 플랜 확정 — 온보딩의 마지막 단계다.
 *
 * 성공하면 프로필 캐시의 status를 함께 올린다. 확정 직후 홈으로 replace하는데,
 * 온보딩 레이아웃이 캐시에 심어둔 `IN_PROGRESS`가 그대로 남아 있으면 홈이 그 값을
 * 읽고 온보딩으로 되돌려 보낸다(staleTime 안이면 refetch조차 안 나가고, stale이어도
 * useQuery가 캐시를 먼저 돌려주므로 refetch보다 리다이렉트가 빠르다).
 *
 * react-query는 mutationFn에 (variables, context) 두 인자를 넘기므로 함수를 그대로
 * 넘기지 않고 감싼다 — 안 그러면 API 함수가 쓰지도 않는 context까지 받는다.
 */
export function confirmOnboardingGoalOptions(queryClient: QueryClient) {
  return mutationOptions({
    mutationFn: (goal: OnboardingGoalConfirm) => confirmOnboardingGoal(goal),
    onSuccess: ({ status }) =>
      queryClient.setQueryData<OnboardingProfile>(ONBOARDING_PROFILE_QUERY_KEY, (profile) =>
        profile ? { ...profile, status } : profile,
      ),
  });
}
