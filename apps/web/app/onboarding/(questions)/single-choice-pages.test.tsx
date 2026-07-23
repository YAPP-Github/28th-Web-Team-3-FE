import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { patchOnboardingProfile } from "@/lib/onboarding-api";
import { OnboardingFormProvider } from "./_components/onboarding-form-provider";
import InvestmentPeriodOnboardingPage from "./period/page";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock("@/lib/onboarding-api", () => ({
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
    fireEvent.click(screen.getByRole("radio", { name: "2년 정도 예상해요" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    await waitFor(() => {
      expect(patchOnboardingProfile).toHaveBeenCalledWith({ goalPeriodMonths: 24 });
      expect(pushMock).toHaveBeenCalledWith("/onboarding/result");
    });
  });
});
