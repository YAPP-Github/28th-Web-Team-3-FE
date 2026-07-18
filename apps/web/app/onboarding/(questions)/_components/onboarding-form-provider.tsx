"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type OnboardingFormValues, onboardingFormSchema } from "@repo/schema";
import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { DEFAULT_ONBOARDING_FORM_VALUES } from "../../constants/form";

export function OnboardingFormProvider({ children }: { children: ReactNode }) {
  const formMethods = useForm<OnboardingFormValues>({
    defaultValues: DEFAULT_ONBOARDING_FORM_VALUES,
    resolver: zodResolver(onboardingFormSchema),
  });

  return <FormProvider {...formMethods}>{children}</FormProvider>;
}
