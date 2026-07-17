import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingFormProvider } from "../_components/onboarding-form-provider";
import ExperienceOnboardingPage from "./page";

const push = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ prefetch: vi.fn(), push }) }));

describe("ExperienceOnboardingPage", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("선택한 투자 경험으로 이전과 다음 질문 사이를 이동한다", async () => {
    render(
      <OnboardingFormProvider>
        <ExperienceOnboardingPage />
      </OnboardingFormProvider>,
    );

    const nextButton = screen.getByRole("button", { name: "다음" });
    expect(nextButton).toBeDisabled();

    fireEvent.click(screen.getByRole("radio", { name: "3년 미만이에요" }));
    fireEvent.click(nextButton);
    await waitFor(() => expect(push).toHaveBeenCalledWith("/onboarding/risk"));

    fireEvent.click(screen.getByRole("button", { name: "이전" }));
    expect(push).toHaveBeenCalledWith("/onboarding/finance");
  });
});
