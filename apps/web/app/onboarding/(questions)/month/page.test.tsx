import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingFormProvider } from "@/app/onboarding/(questions)/_components/onboarding-form-provider";
import { patchOnboardingProfile } from "@/lib/onboarding-api";
import MonthlyIncomeAndSavingsOnboardingPage from "./page";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock("@/lib/onboarding-api", () => ({
  getOnboardingProfile: vi.fn().mockRejectedValue(new Error("test")),
  patchOnboardingProfile: vi.fn().mockResolvedValue({}),
}));

function renderMonthOnboardingPage() {
  return render(
    <OnboardingFormProvider>
      <MonthlyIncomeAndSavingsOnboardingPage />
    </OnboardingFormProvider>,
  );
}

describe("MonthlyIncomeAndSavingsOnboardingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("금액을 입력하기 전에는 다음 버튼이 비활성화된다", () => {
    renderMonthOnboardingPage();

    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
  });

  it("직접 입력한 월급과 저축액을 완료하면 입력창을 닫는다", async () => {
    renderMonthOnboardingPage();

    fireEvent.click(screen.getByRole("button", { name: "직접 입력" }));

    fireEvent.change(screen.getByRole("textbox", { name: "월급만원" }), {
      target: { value: "300" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "월 저축액만원" }), {
      target: { value: "100" },
    });

    fireEvent.click(screen.getByRole("button", { name: "완료" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("이전 버튼이 이전 질문 경로로 이동한다", () => {
    renderMonthOnboardingPage();

    fireEvent.click(screen.getByRole("button", { name: "이전" }));
    expect(pushMock).toHaveBeenCalledWith("/onboarding/age");
  });

  it("직접 입력 금액은 백엔드 상한 650만원을 넘을 수 없다", () => {
    renderMonthOnboardingPage();

    fireEvent.click(screen.getByRole("button", { name: "직접 입력" }));
    fireEvent.change(screen.getByRole("textbox", { name: "월급만원" }), {
      target: { value: "700" },
    });

    expect(screen.getByRole("textbox", { name: "월급만원" })).toHaveValue("650");
  });

  it("다음 단계에서 월급과 저축액 필드만 저장한다", async () => {
    renderMonthOnboardingPage();
    fireEvent.click(screen.getByRole("button", { name: "직접 입력" }));
    fireEvent.change(screen.getByRole("textbox", { name: "월급만원" }), {
      target: { value: "300" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "월 저축액만원" }), {
      target: { value: "100" },
    });
    fireEvent.click(screen.getByRole("button", { name: "완료" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    await waitFor(() =>
      expect(patchOnboardingProfile).toHaveBeenCalledWith({
        monthlySalaryManwon: 300,
        monthlySavingManwon: 100,
      }),
    );
  });
});
