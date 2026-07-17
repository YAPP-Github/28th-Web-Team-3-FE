import type { ReactNode } from "react";
import { OnboardingFormProvider } from "./(questions)/_components/onboarding-form-provider";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh bg-gray-0">
      <OnboardingFormProvider>{children}</OnboardingFormProvider>
    </main>
  );
}
