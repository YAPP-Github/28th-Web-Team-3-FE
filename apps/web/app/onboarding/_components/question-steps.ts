export const QUESTION_STEPS = [
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

export type QuestionStep = (typeof QUESTION_STEPS)[number];

export function getQuestionStepIndex(pathname: string) {
  return QUESTION_STEPS.findIndex((step) => pathname === `/onboarding/${step}`);
}
