import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  confirmOnboardingGoal,
  getOnboardingGoalPlans,
  getOnboardingReport,
} from "@/lib/onboarding-api";
import OnboardingResultPage from "./page";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/lib/onboarding-api", () => ({
  confirmOnboardingGoal: vi.fn().mockResolvedValue({}),
  getOnboardingGoalPlans: vi.fn(),
  getOnboardingReport: vi.fn(),
}));

const report = {
  simulation: {
    baselineManwon: 11_200,
    simulationManwon: 11_380,
    diffManwon: 180,
    upliftPercent: 2,
    periodMonths: 12,
  },
  peer: { assetRatioPercent: 50, incomeTopPercent: 30, consumptionTopPercent: 40 },
  histogram: {
    income: { bins: [], markerManwon: 300 },
    consumption: { bins: [], markerManwon: 200 },
  },
  diagnosis: { branchCode: 1, message: "저축액을 조금 높이면 목표에 가까워져요." },
  disclaimer: "안내",
  datasetVersion: "1",
  configVersion: "1",
};

const goalPlans = {
  monthlySavingManwon: 100,
  periodMonths: 12,
  plans: [
    {
      plan: "PLAN_1" as const,
      label: "확실하게",
      default: true,
      increaseMinManwon: 10,
      increaseMaxManwon: 20,
      checkpoints: [],
      card: { month: 12, amountManwon: 1200 },
    },
    {
      plan: "PLAN_2" as const,
      label: "여유롭게",
      default: false,
      increaseMinManwon: 0,
      increaseMaxManwon: 10,
      checkpoints: [],
      card: { month: 12, amountManwon: 1100 },
    },
  ],
};

describe("OnboardingResultPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getOnboardingReport).mockResolvedValue(report);
    vi.mocked(getOnboardingGoalPlans).mockResolvedValue(goalPlans);
  });

  it("report 응답과 goal-plans를 표시한다", async () => {
    render(<OnboardingResultPage />);
    expect(await screen.findByText("11,380만원 예상")).toBeInTheDocument();
    expect(screen.getByText("180만원")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "확실하게" })).toBeChecked();
  });

  it("선택한 목표 플랜을 확정한다", async () => {
    render(<OnboardingResultPage />);
    fireEvent.click(await screen.findByRole("radio", { name: "여유롭게" }));
    fireEvent.click(screen.getByRole("button", { name: "이 목표로 시작" }));

    await waitFor(() => expect(confirmOnboardingGoal).toHaveBeenCalledWith({ plan: "PLAN_2" }));
    expect(await screen.findByText("목표 설정을 완료했어요.")).toBeInTheDocument();
  });
});
