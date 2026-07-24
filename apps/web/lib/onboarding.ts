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
    const response = await api.get(`${ONBOARDING_PATH}/profile`).json();
    return onboardingProfileSchema.parse(response);
  } catch (error) {
    if (isMissingOnboardingProfile(error)) return EMPTY_ONBOARDING_PROFILE;
    throw error;
  }
}

export async function patchOnboardingProfile(
  profile: OnboardingProfilePatch,
): Promise<OnboardingProfile> {
  const response = await api.patch(`${ONBOARDING_PATH}/profile`, { json: profile }).json();
  return onboardingProfileSchema.parse(response);
}

export async function getOnboardingReport(): Promise<OnboardingReport> {
  const response = await api.get(`${ONBOARDING_PATH}/report`).json();
  return onboardingReportSchema.parse(response);
}

export async function getOnboardingGoalPlans(): Promise<OnboardingGoalPlans> {
  const response = await api.get(`${ONBOARDING_PATH}/goal-plans`).json();
  return onboardingGoalPlansSchema.parse(response);
}

export async function confirmOnboardingGoal(goal: OnboardingGoalConfirm): Promise<OnboardingGoal> {
  const response = await api.post(`${ONBOARDING_PATH}/goal`, { json: goal }).json();
  return onboardingGoalSchema.parse(response);
}
