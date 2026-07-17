export const ONBOARDING_QUESTION_STEPS = [
  "age",
  "month",
  "net",
  "finance",
  "experience",
  "risk",
  "loss",
  "period",
  "interest",
] as const;

export type OnboardingQuestionStep = (typeof ONBOARDING_QUESTION_STEPS)[number];
