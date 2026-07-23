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
import { api } from "@/lib/api";

const ONBOARDING_PATH = "api/onboarding";

export async function getOnboardingProfile(): Promise<OnboardingProfile> {
  const response = await api.get(`${ONBOARDING_PATH}/profile`).json();
  return onboardingProfileSchema.parse(response);
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
