import type { OnboardingFormValues } from "@repo/schema";
import { render, screen } from "@testing-library/react";
import { useFormContext } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { getOnboardingProfile } from "@/lib/onboarding-api";
import { OnboardingFormProvider } from "./onboarding-form-provider";

vi.mock("@/lib/onboarding-api", () => ({ getOnboardingProfile: vi.fn() }));

function RestoredProfile() {
  const { watch } = useFormContext<OnboardingFormValues>();
  return <output>{JSON.stringify(watch())}</output>;
}

describe("OnboardingFormProvider", () => {
  it("GET profile 응답으로 기존 입력을 복원한다", async () => {
    vi.mocked(getOnboardingProfile).mockResolvedValue({
      status: "IN_PROGRESS",
      birthDate: "1998-03-01",
      monthlySalaryManwon: 300,
      monthlySavingManwon: 100,
      netWorthManwon: 1000,
      goalPeriodMonths: 24,
    });

    render(
      <OnboardingFormProvider>
        <RestoredProfile />
      </OnboardingFormProvider>,
    );

    expect(await screen.findByText(/"birthDate":"1998-03-01"/)).toHaveTextContent(
      '"goalPeriodMonths":24',
    );
  });
});
