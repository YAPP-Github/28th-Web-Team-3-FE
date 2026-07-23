import type { OnboardingFormValues } from "@repo/schema";
import { render } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { afterEach, describe, expect, it, vi } from "vitest";
import OnboardingResultPage from "./page";

const sampleOnboardingFormValues: OnboardingFormValues = {
  ageGroup: "twenties",
  income: 300,
  investmentPeriod: "about-one-year",
  netWorth: "10000",
  savings: 100,
};

function OnboardingResultPageTestHarness() {
  const formMethods = useForm<OnboardingFormValues>({ defaultValues: sampleOnboardingFormValues });

  return (
    <FormProvider {...formMethods}>
      <OnboardingResultPage />
    </FormProvider>
  );
}

describe("OnboardingResultPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("수집한 온보딩 입력값을 콘솔에 출력한다", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

    render(<OnboardingResultPageTestHarness />);

    expect(log).toHaveBeenCalledWith("Onboarding form values:", sampleOnboardingFormValues);
  });
});
