import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingFormProvider } from "@/app/onboarding/(questions)/_components/onboarding-form-provider";
import NetWorthOnboardingPage from "./page";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));

function renderNetWorthOnboardingPage() {
  return render(
    <OnboardingFormProvider>
      <NetWorthOnboardingPage />
    </OnboardingFormProvider>,
  );
}

describe("NetWorthOnboardingPage", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it("금액을 입력하기 전에는 다음 버튼이 비활성화된다", () => {
    renderNetWorthOnboardingPage();

    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
  });

  it("한도 초과 직접 입력은 최대값으로 제한한다", () => {
    renderNetWorthOnboardingPage();

    fireEvent.click(screen.getByRole("button", { name: "직접 입력" }));
    fireEvent.change(screen.getByRole("textbox", { name: "순자산만원" }), {
      target: { value: "10000000000000000000" },
    });

    expect(screen.getByRole("textbox", { name: "순자산만원" })).toHaveValue("999999999999999");
  });

  it("슬라이더 상한을 넘는 값은 바를 누르면 1억원으로 돌아온다", async () => {
    renderNetWorthOnboardingPage();

    fireEvent.click(screen.getByRole("button", { name: "직접 입력" }));
    fireEvent.change(screen.getByRole("textbox", { name: "순자산만원" }), {
      target: { value: "10001" },
    });
    fireEvent.click(screen.getByRole("button", { name: "완료" }));

    const sliderActivationButton = screen.getByRole("button", { name: "순자산 슬라이더 활성화" });
    expect(sliderActivationButton.querySelector(".bg-primary")).toHaveClass("w-full");

    fireEvent.click(sliderActivationButton);

    expect(screen.getByText("자산 10,000만원")).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "순자산" })).toBeInTheDocument();
  });

  it("입력한 순자산으로 다음 질문으로 이동한다", async () => {
    renderNetWorthOnboardingPage();

    fireEvent.click(screen.getByRole("button", { name: "직접 입력" }));
    fireEvent.change(screen.getByRole("textbox", { name: "순자산만원" }), {
      target: { value: "10000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "완료" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/onboarding/period"));
  });

  it("이전 버튼이 월급 질문 경로로 이동한다", () => {
    renderNetWorthOnboardingPage();

    fireEvent.click(screen.getByRole("button", { name: "이전" }));
    expect(pushMock).toHaveBeenCalledWith("/onboarding/month");
  });
});
