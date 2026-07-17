"use client";

import type { OnboardingFormValues } from "@repo/schema";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

export default function OnboardingResultPage() {
  const { getValues } = useFormContext<OnboardingFormValues>();

  useEffect(() => {
    // biome-ignore lint/suspicious/noConsole: 임시 결과 화면에서 수집값을 확인한다.
    console.log("Onboarding form values:", getValues());
  }, [getValues]);

  return null;
}
