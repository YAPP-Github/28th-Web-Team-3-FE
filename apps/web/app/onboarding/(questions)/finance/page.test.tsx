import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingFormProvider } from "../_components/onboarding-form-provider";
import FinanceOnboardingPage from "./page";

const push = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ prefetch: vi.fn(), push }) }));

describe("FinanceOnboardingPage", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("선택 전에는 다음 버튼이 비활성화되고 선택하면 다음 질문으로 이동한다", async () => {
    render(
      <OnboardingFormProvider>
        <FinanceOnboardingPage />
      </OnboardingFormProvider>,
    );

    const nextButton = screen.getByRole("button", { name: "다음" });
    expect(nextButton).toBeDisabled();

    fireEvent.click(screen.getByRole("radio", { name: "절반 정도예요" }));
    expect(nextButton).toBeEnabled();

    fireEvent.click(nextButton);
    await waitFor(() => expect(push).toHaveBeenCalledWith("/onboarding/experience"));

    fireEvent.click(screen.getByRole("button", { name: "이전" }));
    expect(push).toHaveBeenCalledWith("/onboarding/net");
  });
});
