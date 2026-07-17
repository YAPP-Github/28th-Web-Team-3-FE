import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingFormProvider } from "../_components/onboarding-form-provider";
import PeriodOnboardingPage from "./page";

const push = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ prefetch: vi.fn(), push }) }));

describe("PeriodOnboardingPage", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("선택한 투자 기간으로 이전과 다음 질문 사이를 이동한다", async () => {
    render(
      <OnboardingFormProvider>
        <PeriodOnboardingPage />
      </OnboardingFormProvider>,
    );

    fireEvent.click(screen.getByRole("radio", { name: "2년 정도 예상해요" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/onboarding/interest"));

    fireEvent.click(screen.getByRole("button", { name: "이전" }));
    expect(push).toHaveBeenCalledWith("/onboarding/loss");
  });
});
