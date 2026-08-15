import {
  type OnboardingGoal,
  type OnboardingGoalConfirm,
  type OnboardingGoalPlans,
  type OnboardingGoalPreview,
  type OnboardingProfile,
  type OnboardingProfilePatch,
  type OnboardingReport,
  onboardingGoalConfirmSchema,
  onboardingGoalPlansSchema,
  onboardingGoalPreviewSchema,
  onboardingGoalSchema,
  onboardingProfilePatchSchema,
  onboardingProfileSchema,
  onboardingReportSchema,
} from "@repo/schema/onboarding-api";
import { HTTPError } from "ky";
import { http } from "@/api/client";

const ONBOARDING_PATH = "onboarding";
const ONBOARDING_V2_PATH = "v2/onboarding";
const EMPTY_ONBOARDING_PROFILE: OnboardingProfile = {
  status: "IN_PROGRESS",
  birthDate: null,
  address: null,
  monthlySalaryManwon: null,
  monthlySavingManwon: null,
  netWorthManwon: null,
  goalPeriodMonths: null,
};

function isMissingOnboardingProfile(error: unknown): boolean {
  if (!(error instanceof HTTPError) || error.response.status !== 404) return false;
  return (
    typeof error.data === "object" &&
    error.data !== null &&
    "name" in error.data &&
    error.data.name === "ONBOARDING_PROFILE_NOT_FOUND"
  );
}

/** 서버에는 확정됐지만 응답을 받지 못한 뒤 재시도한 경우를 완료 상태로 복구한다. */
export function isOnboardingAlreadyCompletedError(error: unknown): boolean {
  if (!(error instanceof HTTPError) || error.response.status !== 409) return false;
  return (
    typeof error.data === "object" &&
    error.data !== null &&
    "name" in error.data &&
    error.data.name === "ONBOARDING_ALREADY_COMPLETED"
  );
}

export async function getOnboardingProfile(): Promise<OnboardingProfile> {
  try {
    return await http.get(`${ONBOARDING_PATH}/profile`, { response: onboardingProfileSchema });
  } catch (error) {
    if (isMissingOnboardingProfile(error)) return EMPTY_ONBOARDING_PROFILE;
    throw error;
  }
}

export function patchOnboardingProfile(
  profile: OnboardingProfilePatch,
): Promise<OnboardingProfile> {
  return http.patch(`${ONBOARDING_PATH}/profile`, {
    body: profile,
    request: onboardingProfilePatchSchema,
    response: onboardingProfileSchema,
  });
}

/** PUT /api/onboarding/profile — 온보딩을 완료한 사용자의 내 정보 수정. */
export function updateOnboardingProfile(
  profile: OnboardingProfilePatch,
): Promise<OnboardingProfile> {
  return http.put(`${ONBOARDING_PATH}/profile`, {
    body: profile,
    request: onboardingProfilePatchSchema,
    response: onboardingProfileSchema,
  });
}

export function getOnboardingReport(): Promise<OnboardingReport> {
  return http.get(`${ONBOARDING_PATH}/report`, { response: onboardingReportSchema });
}

export function getOnboardingGoalPlans(): Promise<OnboardingGoalPlans> {
  return http.get(`${ONBOARDING_PATH}/goal-plans`, { response: onboardingGoalPlansSchema });
}

export function getOnboardingGoalPreview(): Promise<OnboardingGoalPreview> {
  return http.get(`${ONBOARDING_V2_PATH}/goal-preview`, {
    response: onboardingGoalPreviewSchema,
  });
}

export function confirmOnboardingGoal(goal: OnboardingGoalConfirm): Promise<OnboardingGoal> {
  return http.post(`${ONBOARDING_V2_PATH}/goal`, {
    body: goal,
    request: onboardingGoalConfirmSchema,
    response: onboardingGoalSchema,
  });
}
