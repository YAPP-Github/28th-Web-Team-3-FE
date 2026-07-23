import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingFormProvider } from "./_components/onboarding-form-provider";
import InvestmentPeriodOnboardingPage from "./period/page";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ prefetch: vi.fn(), push: pushMock }) }));

describe("single choice onboarding pages", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it("목표 기간 페이지는 선택값으로 순자산 질문과 결과 사이를 이동한다", async () => {
    render(
      <OnboardingFormProvider>
        <InvestmentPeriodOnboardingPage />
      </OnboardingFormProvider>,
    );

    const nextButton = screen.getByRole("button", { name: "다음" });
    expect(
      screen.getByRole("radiogroup", { name: "현재 투자자금의 예상 투자 기간은 얼마나 되나요?" }),
    ).toBeInTheDocument();
    expect(nextButton).toBeDisabled();

    fireEvent.click(screen.getByRole("radio", { name: "2년 정도 예상해요" }));
    expect(nextButton).toBeEnabled();

    fireEvent.click(nextButton);
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/onboarding/result"));

    fireEvent.click(screen.getByRole("button", { name: "이전" }));
    expect(pushMock).toHaveBeenCalledWith("/onboarding/net");
  });
});
