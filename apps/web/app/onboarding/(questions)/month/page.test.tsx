import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MonthOnboardingPage from "./page";

const push = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

describe("MonthOnboardingPage", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("금액을 입력하기 전에는 다음 버튼이 비활성화된다", () => {
    render(<MonthOnboardingPage />);

    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
  });

  it("직접 입력한 월급과 저축액을 완료하면 다음 버튼이 활성화된다", () => {
    render(<MonthOnboardingPage />);

    fireEvent.click(screen.getByRole("button", { name: "직접 입력" }));

    fireEvent.change(screen.getByRole("textbox", { name: "월급만원" }), {
      target: { value: "300" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "월 저축액만원" }), {
      target: { value: "100" },
    });

    fireEvent.click(screen.getByRole("button", { name: "완료" }));

    const nextButton = screen.getByRole("button", { name: "다음" });
    expect(nextButton).toBeEnabled();

    fireEvent.click(nextButton);
    expect(push).toHaveBeenCalledWith("/onboarding/finance");
  });

  it("이전 버튼이 이전 질문 경로로 이동한다", () => {
    render(<MonthOnboardingPage />);

    fireEvent.click(screen.getByRole("button", { name: "이전" }));
    expect(push).toHaveBeenCalledWith("/onboarding/age");
  });
});
