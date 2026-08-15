import {
  ONBOARDING_QUESTION_STEPS,
  type OnboardingQuestionStep,
} from "@/app/onboarding/constants/question-steps";

export function getOnboardingQuestionStepIndex(pathname: string) {
  return ONBOARDING_QUESTION_STEPS.findIndex(
    (questionStep) => pathname === `/onboarding/${questionStep}`,
  );
}

export function getPreviousOnboardingQuestionPath(questionStep: OnboardingQuestionStep) {
  const questionStepIndex = ONBOARDING_QUESTION_STEPS.indexOf(questionStep);

  return questionStepIndex === 0
    ? "/onboarding/intro"
    : `/onboarding/${ONBOARDING_QUESTION_STEPS[questionStepIndex - 1]}`;
}

export function getNextOnboardingQuestionPath(questionStep: OnboardingQuestionStep) {
  const questionStepIndex = ONBOARDING_QUESTION_STEPS.indexOf(questionStep);
  const nextQuestionStep = ONBOARDING_QUESTION_STEPS[questionStepIndex + 1];

  return nextQuestionStep ? `/onboarding/${nextQuestionStep}` : "/onboarding/check";
}
