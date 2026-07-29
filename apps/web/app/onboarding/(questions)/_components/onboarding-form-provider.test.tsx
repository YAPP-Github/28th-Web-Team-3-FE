import type { OnboardingFormValues } from "@repo/schema";
import { useFormContext } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { getOnboardingProfile } from "@/lib/onboarding/api";
import { act, fireEvent, render, screen } from "@/lib/test/react";
import { OnboardingFormProvider } from "./onboarding-form-provider";

vi.mock("@/lib/onboarding/api", () => ({ getOnboardingProfile: vi.fn() }));

function RestoredProfile() {
  const { setValue, watch } = useFormContext<OnboardingFormValues>();
  return (
    <>
      <button
        type="button"
        onClick={() => setValue("birthDate", "2000-01-01", { shouldDirty: true })}
      >
        생년월일 변경
      </button>
      <output>{JSON.stringify(watch())}</output>
    </>
  );
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

  it("늦게 도착한 profile 응답이 사용자가 입력한 값을 덮지 않는다", async () => {
    let resolveProfile: (profile: Awaited<ReturnType<typeof getOnboardingProfile>>) => void;
    vi.mocked(getOnboardingProfile).mockImplementation(
      () => new Promise((resolve) => (resolveProfile = resolve)),
    );

    render(
      <OnboardingFormProvider>
        <RestoredProfile />
      </OnboardingFormProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "생년월일 변경" }));

    await act(async () => {
      resolveProfile({
        status: "IN_PROGRESS",
        birthDate: "1998-03-01",
        monthlySalaryManwon: 300,
        monthlySavingManwon: 100,
        netWorthManwon: 1000,
        goalPeriodMonths: 24,
      });
    });

    expect(screen.getByText(/"birthDate":"2000-01-01"/)).toBeInTheDocument();
  });
});
