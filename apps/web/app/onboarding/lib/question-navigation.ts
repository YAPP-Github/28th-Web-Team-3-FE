import { QUESTION_STEPS, type QuestionStep } from "../constants/question-steps";

export function getQuestionStepIndex(pathname: string) {
  return QUESTION_STEPS.findIndex((step) => pathname === `/onboarding/${step}`);
}

export function getPreviousQuestionPath(step: QuestionStep) {
  const stepIndex = QUESTION_STEPS.indexOf(step);

  return stepIndex === 0 ? "/onboarding/intro" : `/onboarding/${QUESTION_STEPS[stepIndex - 1]}`;
}

export function getNextQuestionPath(step: QuestionStep) {
  const stepIndex = QUESTION_STEPS.indexOf(step);
  const nextStep = QUESTION_STEPS[stepIndex + 1];

  return nextStep ? `/onboarding/${nextStep}` : "/onboarding/result";
}
