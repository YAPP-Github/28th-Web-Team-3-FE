import { parseJson } from "@repo/api/json";
import {
  type OnboardingGoal,
  type OnboardingGoalConfirm,
  type OnboardingGoalPlans,
  type OnboardingProfile,
  type OnboardingProfilePatch,
  type OnboardingReport,
  onboardingGoalPlansSchema,
  onboardingGoalSchema,
  onboardingProfileSchema,
  onboardingReportSchema,
} from "@repo/schema/onboarding-api";
import { HTTPError } from "ky";
import { api } from "@/lib/api";

const ONBOARDING_PATH = "onboarding";
const EMPTY_ONBOARDING_PROFILE: OnboardingProfile = {
  status: "IN_PROGRESS",
  birthDate: null,
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

export async function getOnboardingProfile(): Promise<OnboardingProfile> {
  try {
    return await parseJson(api.get(`${ONBOARDING_PATH}/profile`), onboardingProfileSchema);
  } catch (error) {
    if (isMissingOnboardingProfile(error)) return EMPTY_ONBOARDING_PROFILE;
    throw error;
  }
}

export function patchOnboardingProfile(
  profile: OnboardingProfilePatch,
): Promise<OnboardingProfile> {
  return parseJson(
    api.patch(`${ONBOARDING_PATH}/profile`, { json: profile }),
    onboardingProfileSchema,
  );
}

export function getOnboardingReport(): Promise<OnboardingReport> {
  return parseJson(api.get(`${ONBOARDING_PATH}/report`), onboardingReportSchema);
}

export function getOnboardingGoalPlans(): Promise<OnboardingGoalPlans> {
  return parseJson(api.get(`${ONBOARDING_PATH}/goal-plans`), onboardingGoalPlansSchema);
}

export function confirmOnboardingGoal(goal: OnboardingGoalConfirm): Promise<OnboardingGoal> {
  return parseJson(api.post(`${ONBOARDING_PATH}/goal`, { json: goal }), onboardingGoalSchema);
}
