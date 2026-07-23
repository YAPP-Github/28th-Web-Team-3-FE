import type { OnboardingFormValues } from "@repo/schema";
import { render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import OnboardingResultPage from "./page";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

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
  it("입력한 자산과 저축액으로 예상 금액을 보여준다", () => {
    render(<OnboardingResultPageTestHarness />);

    expect(screen.getByText("11,380만원 예상")).toBeInTheDocument();
    expect(screen.getByText("180만원")).toBeInTheDocument();
  });
});
