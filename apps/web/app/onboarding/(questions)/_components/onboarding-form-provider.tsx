"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type OnboardingFormValues, onboardingFormSchema } from "@repo/schema";
import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";

export function OnboardingFormProvider({ children }: { children: ReactNode }) {
  const methods = useForm<OnboardingFormValues>({
    defaultValues: {
      income: 0,
      savings: 0,
    },
    resolver: zodResolver(onboardingFormSchema),
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}
