"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type OnboardingFormValues, onboardingFormSchema } from "@repo/schema/onboarding";
import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { DEFAULT_ONBOARDING_FORM_VALUES } from "@/app/onboarding/constants/form";
import { onboardingProfileOptions } from "@/lib/queries/onboarding";

export function OnboardingFormProvider({ children }: { children: ReactNode }) {
  const formMethods = useForm<OnboardingFormValues>({
    defaultValues: DEFAULT_ONBOARDING_FORM_VALUES,
    resolver: zodResolver(onboardingFormSchema),
  });
  const { data: profile } = useQuery(onboardingProfileOptions());

  useEffect(
    function syncOnboardingProfile() {
      if (!profile) return;

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
    },
    [formMethods, profile],
  );

  return <FormProvider {...formMethods}>{children}</FormProvider>;
}
