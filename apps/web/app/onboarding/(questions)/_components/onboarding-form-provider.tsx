"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type OnboardingFormValues, onboardingFormSchema } from "@repo/schema";
import { type ReactNode, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { DEFAULT_ONBOARDING_FORM_VALUES } from "@/app/onboarding/constants/form";
import { getOnboardingProfile } from "@/lib/onboarding";

export function OnboardingFormProvider({ children }: { children: ReactNode }) {
  const formMethods = useForm<OnboardingFormValues>({
    defaultValues: DEFAULT_ONBOARDING_FORM_VALUES,
    resolver: zodResolver(onboardingFormSchema),
  });

  useEffect(
    function syncOnboardingProfile() {
      let active = true;

      getOnboardingProfile()
        .then((profile) => {
          if (!active) return;
          formMethods.reset(
            {
              birthDate: profile.birthDate ?? "",
              monthlySalaryManwon: profile.monthlySalaryManwon ?? 0,
              monthlySavingManwon: profile.monthlySavingManwon ?? 0,
              netWorthManwon: profile.netWorthManwon ?? 0,
              goalPeriodMonths: profile.goalPeriodMonths ?? "",
            },
            { keepDirtyValues: true },
          );
        })
        .catch(() => undefined);

      return () => {
        active = false;
      };
    },
    [formMethods],
  );

  return <FormProvider {...formMethods}>{children}</FormProvider>;
}
