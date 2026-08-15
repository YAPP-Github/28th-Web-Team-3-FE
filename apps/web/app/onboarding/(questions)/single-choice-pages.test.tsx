import { beforeEach, describe, expect, it, vi } from "vitest";
import { patchOnboardingProfile } from "@/api/onboarding";
import { fireEvent, render, screen, waitFor } from "@/lib/test/react";
import { OnboardingFormProvider } from "./_components/onboarding-form-provider";
import InvestmentPeriodOnboardingPage from "./period/page";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock("@/api/onboarding", () => ({
  getOnboardingProfile: vi.fn().mockRejectedValue(new Error("test")),
  patchOnboardingProfile: vi.fn().mockResolvedValue({}),
}));

describe("period onboarding page", () => {
  beforeEach(() => vi.clearAllMocks());

  it("목표 기간 개월 수만 저장하고 결과로 이동한다", async () => {
    render(
      <OnboardingFormProvider>
        <InvestmentPeriodOnboardingPage />
      </OnboardingFormProvider>,
    );
    const slider = screen.getByRole("slider", { name: "목표기간" });
    for (let index = 0; index < 4; index += 1) {
      fireEvent.keyDown(slider, { key: "ArrowRight" });
    }
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    await waitFor(() => {
      expect(patchOnboardingProfile).toHaveBeenCalledWith({ goalPeriodMonths: 24 });
      expect(pushMock).toHaveBeenCalledWith("/onboarding/check");
    });
  });

  it("0년부터 3년까지 6개월 단위로 목표기간을 선택한다", () => {
    render(
      <OnboardingFormProvider>
        <InvestmentPeriodOnboardingPage />
      </OnboardingFormProvider>,
    );

    const slider = screen.getByRole("slider", { name: "목표기간" });
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "36");
    expect(screen.getByText("목표기간 0년")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider).toHaveAttribute("aria-valuenow", "6");
    expect(screen.getByText("목표기간 6개월")).toBeInTheDocument();
  });
});
