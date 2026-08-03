import type { CurrentUser } from "@repo/schema/auth";
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
import { currentUserOptions } from "@/lib/queries/auth";

/** 프로필 캐시 키. 밖에서는 `onboardingProfileOptions().queryKey`로 꺼낸다. */
const ONBOARDING_PROFILE_QUERY_KEY = ["onboarding", "profile"] as const;
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
 * 성공하면 프로필과 현재 사용자 캐시의 완료 상태를 함께 올린다. 확정 직후 홈으로
 * replace할 때 기존 미완료 캐시가 남아 있으면 라우트 가드가 온보딩으로 되돌려 보낸다.
 *
 * react-query는 mutationFn에 (variables, context) 두 인자를 넘기므로 함수를 그대로
 * 넘기지 않고 감싼다 — 안 그러면 API 함수가 쓰지도 않는 context까지 받는다.
 */
export function confirmOnboardingGoalOptions(queryClient: QueryClient) {
  return mutationOptions({
    mutationFn: (goal: OnboardingGoalConfirm) => confirmOnboardingGoal(goal),
    onSuccess: ({ status }) => {
      queryClient.setQueryData<OnboardingProfile>(ONBOARDING_PROFILE_QUERY_KEY, (profile) =>
        profile ? { ...profile, status } : profile,
      );
      queryClient.setQueryData<CurrentUser>(currentUserOptions.key(), (currentUser) =>
        currentUser ? { ...currentUser, onboardingCompleted: status === "COMPLETED" } : currentUser,
      );
    },
  });
}
