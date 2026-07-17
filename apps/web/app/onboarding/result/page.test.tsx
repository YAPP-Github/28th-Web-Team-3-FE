import type { OnboardingFormValues } from "@repo/schema";
import { render } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { afterEach, describe, expect, it, vi } from "vitest";
import OnboardingResultPage from "./page";

const formValues: OnboardingFormValues = {
  ageGroup: "twenties",
  financialAssetRatio: "about-half",
  income: 300,
  investmentExperience: "under-three-years",
  investmentPeriod: "about-one-year",
  lossTolerance: "up-to-twenty-percent",
  netWorth: "10000",
  riskPreference: "capital-preservation-focused",
  savings: 100,
  taxSavingInterest: "later",
};

function ResultPageWithForm() {
  const methods = useForm<OnboardingFormValues>({ defaultValues: formValues });

  return (
    <FormProvider {...methods}>
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

    render(<ResultPageWithForm />);

    expect(log).toHaveBeenCalledWith("Onboarding form values:", formValues);
  });
});
