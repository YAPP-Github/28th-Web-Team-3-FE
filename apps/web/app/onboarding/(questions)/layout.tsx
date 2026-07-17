import type { ReactNode } from "react";
import { QuestionHeader } from "../_components/question-header";
import { OnboardingFormProvider } from "./_components/onboarding-form-provider";

export default function QuestionsLayout({ children }: { children: ReactNode }) {
  return (
    <OnboardingFormProvider>
      <QuestionHeader />
      {children}
    </OnboardingFormProvider>
  );
}
