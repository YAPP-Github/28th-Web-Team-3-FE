import type {
  OnboardingGoalConfirm,
  OnboardingProfile,
  OnboardingProfilePatch,
} from "@repo/schema/onboarding-api";
import { mutationOptions, type QueryClient, queryOptions } from "@tanstack/react-query";
import {
  confirmOnboardingGoal,
  getOnboardingGoalPreview,
  getOnboardingProfile,
  isOnboardingAlreadyCompletedError,
  patchOnboardingProfile,
  updateOnboardingProfile,
} from "@/api/onboarding";
import { currentUserOptions } from "@/lib/queries/auth";
import { goalStatusOptions } from "@/lib/queries/goal";

/**
 * 온보딩 캐시 키의 뿌리. 아래 캐시는 전부 프로필에서 파생되므로, 프로필을 바꾸는 쪽은
 * 이 뿌리 하나로 한꺼번에 무효화한다(`lib/queries/goal.ts`도 목표 수정 뒤 이 키를 쓴다).
 */
export const ONBOARDING_QUERY_KEY = ["onboarding"] as const;

/** 프로필 캐시 키. 밖에서는 `onboardingProfileOptions().queryKey`로 꺼낸다. */
const ONBOARDING_PROFILE_QUERY_KEY = [...ONBOARDING_QUERY_KEY, "profile"] as const;
const ONBOARDING_REPORT_QUERY_KEY = [...ONBOARDING_QUERY_KEY, "report"] as const;
const ONBOARDING_GOAL_PREVIEW_QUERY_KEY = [...ONBOARDING_QUERY_KEY, "goal-preview", "v2"] as const;

/**
 * 온보딩 프로필 조회. 홈의 온보딩 완료 판정과 질문 퍼널의 초기값 복원이
 * 같은 queryKey를 공유해 화면마다 따로 요청하지 않는다.
 */
export function onboardingProfileOptions() {
  return queryOptions({
    queryKey: ONBOARDING_PROFILE_QUERY_KEY,
    queryFn: getOnboardingProfile,
  });
}

/** v2 목표 설정 화면의 추천값과 슬라이더 범위를 조회한다. */
export function onboardingGoalPreviewOptions() {
  return queryOptions({
    queryKey: ONBOARDING_GOAL_PREVIEW_QUERY_KEY,
    queryFn: getOnboardingGoalPreview,
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
 * 프로필에서 파생되는 서버 값들을 함께 무효화한다.
 *
 * 목표 현황의 총 저축액이 "온보딩 순자산 + 누적 저축"이라 순자산만 고쳐도 진행률이 움직이고,
 * 리포트도 월급·월저축을 재료로 쓴다. 목표 캐시는 staleTime이 60초라 무효화하지 않으면
 * 저장 직후 돌아온 화면이 1분 동안 옛 값을 보여준다.
 *
 * 온보딩 퍼널 전용 캐시(목표 미리보기·플랜)는 여기서 건드리지 않는다 — 이 경로는 완료
 * 사용자의 "내 정보 수정"이라 그 화면으로 돌아가지 않는다.
 */
function invalidateProfileDerived(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: goalStatusOptions().queryKey }),
    queryClient.invalidateQueries({ queryKey: ONBOARDING_REPORT_QUERY_KEY }),
  ]);
}

/** 완료 사용자의 프로필 수정 — 성공하면 프로필 캐시를 응답값으로 갱신한다. */
export function updateOnboardingProfileOptions(queryClient: QueryClient) {
  return mutationOptions({
    mutationFn: (profile: OnboardingProfilePatch) => updateOnboardingProfile(profile),
    onSuccess: (profile) => {
      queryClient.setQueryData(ONBOARDING_PROFILE_QUERY_KEY, profile);
      return invalidateProfileDerived(queryClient);
    },
  });
}

/**
 * 선택한 월 저축 목표 확정 — 온보딩의 마지막 단계다.
 *
 * 성공하면 프로필과 현재 사용자 캐시의 완료 상태를 함께 올린다. 확정 직후 홈으로
 * replace할 때 기존 미완료 캐시가 남아 있으면 라우트 가드가 온보딩으로 되돌려 보낸다.
 *
 * react-query는 mutationFn에 (variables, context) 두 인자를 넘기므로 함수를 그대로
 * 넘기지 않고 감싼다 — 안 그러면 API 함수가 쓰지도 않는 context까지 받는다.
 */
export function confirmOnboardingGoalOptions(queryClient: QueryClient) {
  const markCompleted = () => {
    queryClient.setQueryData<OnboardingProfile>(ONBOARDING_PROFILE_QUERY_KEY, (profile) =>
      profile ? { ...profile, status: "COMPLETED" } : profile,
    );
    // queryKey에 DataTag가 붙어 있어 데이터 타입이 options에서 추론된다 — 제네릭 불필요.
    queryClient.setQueryData(currentUserOptions().queryKey, (currentUser) =>
      currentUser ? { ...currentUser, onboardingCompleted: true } : currentUser,
    );
  };

  return mutationOptions({
    mutationFn: (goal: OnboardingGoalConfirm) => confirmOnboardingGoal(goal),
    onSuccess: markCompleted,
    onError: (error) => {
      if (isOnboardingAlreadyCompletedError(error)) markCompleted();
    },
  });
}
