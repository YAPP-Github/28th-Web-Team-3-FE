export const ONBOARDING_QUESTION_STEPS = ["age", "address", "month", "net", "period"] as const;

export type OnboardingQuestionStep = (typeof ONBOARDING_QUESTION_STEPS)[number];
