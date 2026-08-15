import type { OnboardingFormValues } from "@repo/schema/onboarding";

export function formatBirthDate(birthDate: string) {
  return birthDate.replaceAll("-", ".");
}

export function formatGoalPeriod(periodMonths: OnboardingFormValues["goalPeriodMonths"]) {
  if (periodMonths === "" || periodMonths === 0) return "0년";

  const years = Math.floor(periodMonths / 12);
  const months = periodMonths % 12;
  if (years === 0) return `${months}개월`;
  return months === 0 ? `${years}년` : `${years}년 ${months}개월`;
}
