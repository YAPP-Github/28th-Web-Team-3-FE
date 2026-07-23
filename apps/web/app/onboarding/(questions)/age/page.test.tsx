import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingFormProvider } from "@/app/onboarding/(questions)/_components/onboarding-form-provider";
import { patchOnboardingProfile } from "@/lib/onboarding-api";
import AgeOnboardingPage from "./page";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ prefetch: vi.fn(), push: pushMock }) }));
vi.mock("@/lib/onboarding-api", () => ({
  getOnboardingProfile: vi.fn().mockRejectedValue(new Error("test")),
  patchOnboardingProfile: vi.fn().mockResolvedValue({}),
}));

describe("AgeOnboardingPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("생년월일을 YYYY.MM.DD로 입력하고 birthDate만 저장한다", async () => {
    render(
      <OnboardingFormProvider>
        <AgeOnboardingPage />
      </OnboardingFormProvider>,
    );

    const input = screen.getByRole("textbox", { name: "생년월일" });
    const nextButton = screen.getByRole("button", { name: "다음" });
    expect(nextButton).toBeDisabled();

    fireEvent.change(input, { target: { value: "19980301" } });
    expect(input).toHaveValue("1998.03.01");
    expect(nextButton).toBeEnabled();
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(patchOnboardingProfile).toHaveBeenCalledWith({ birthDate: "1998-03-01" });
      expect(pushMock).toHaveBeenCalledWith("/onboarding/month");
    });
  });
});
