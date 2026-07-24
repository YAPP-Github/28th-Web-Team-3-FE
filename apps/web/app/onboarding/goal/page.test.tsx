import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { confirmOnboardingGoal, getOnboardingGoalPlans } from "@/lib/onboarding-api";
import OnboardingGoalPage from "./page";

const push = vi.fn();
const replace = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace }) }));
vi.mock("@/lib/onboarding-api", () => ({
  confirmOnboardingGoal: vi.fn(),
  getOnboardingGoalPlans: vi.fn(),
}));

const goalPlans = {
  monthlySavingManwon: 100,
  periodMonths: 12,
  plans: [
    {
      plan: "PLAN_1" as const,
      label: "확실하게",
      default: true,
      increaseMinManwon: 180,
      increaseMaxManwon: 360,
      checkpoints: [
        { month: 3, amountManwon: 246 },
        { month: 6, amountManwon: 492 },
        { month: 9, amountManwon: 984 },
        { month: 12, amountManwon: 1968 },
      ],
      card: { month: 12, amountManwon: 1968 },
    },
    {
      plan: "PLAN_2" as const,
      label: "여유롭게",
      default: false,
      increaseMinManwon: 120,
      increaseMaxManwon: 240,
      checkpoints: [
        { month: 3, amountManwon: 180 },
        { month: 6, amountManwon: 360 },
        { month: 9, amountManwon: 720 },
        { month: 12, amountManwon: 1440 },
      ],
      card: { month: 12, amountManwon: 1440 },
    },
  ],
};

describe("OnboardingGoalPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getOnboardingGoalPlans).mockResolvedValue(goalPlans);
    vi.mocked(confirmOnboardingGoal).mockResolvedValue({
      goalId: 1,
      plan: "PLAN_2",
      periodMonths: 12,
      targetAmountManwon: 1440,
      status: "COMPLETED",
    });
  });

  it("기본 플랜의 목표 금액과 기간별 예상 금액을 표시한다", async () => {
    render(<OnboardingGoalPage />);

    expect(await screen.findByRole("heading", { name: /2가지 목표금액을/ })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "1안 확실하게" })).toBeChecked();
    expect(screen.getByText("지금 저축액에서 15~30% 더 모으기")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /3개월 246만원/ })).toBeInTheDocument();
    expect(screen.getByText("12개월 뒤 1,968만원 예상")).toBeInTheDocument();
  });

  it("선택한 플랜을 확정하고 홈으로 이동한다", async () => {
    render(<OnboardingGoalPage />);
    fireEvent.click(await screen.findByRole("radio", { name: "2안 여유롭게" }));
    fireEvent.click(screen.getByRole("button", { name: "이 목표로 시작" }));

    await waitFor(() => expect(confirmOnboardingGoal).toHaveBeenCalledWith({ plan: "PLAN_2" }));
    expect(replace).toHaveBeenCalledWith("/");
  });

  it("다시하기를 누르면 온보딩 첫 단계로 이동한다", async () => {
    render(<OnboardingGoalPage />);
    fireEvent.click(await screen.findByRole("button", { name: "다시하기" }));

    expect(push).toHaveBeenCalledWith("/onboarding/age");
  });
});
