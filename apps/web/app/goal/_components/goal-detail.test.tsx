import type { GoalStatus } from "@repo/schema/goal";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// 조회/변경 훅을 목으로 대체한다 — 데이터 주입 후 렌더·인터랙션 로직을 검증한다.
// (API 연동 자체는 브라우저 MSW로 별도 확인. vitest jsdom은 msw/node fetch를 가로채지 못한다.)
const MOCK_GOAL: GoalStatus = {
  targetAmountManwon: 3050,
  totalSavedManwon: 1950,
  progressPercent: 100,
  usageMonths: 8,
  deadlineDDay: 486,
  thisMonth: { targetManwon: 82, savedManwon: 67, progressPercent: 82, dDay: 12 },
};

const mutation = { mutate: vi.fn(), isPending: false };

vi.mock("../queries", () => ({
  useGoalStatus: () => ({ data: MOCK_GOAL, isPending: false, isError: false }),
  useUpdateSavings: () => mutation,
  useUpdateGoal: () => mutation,
}));

vi.mock("@/lib/onboarding", () => ({
  getOnboardingProfile: vi.fn().mockResolvedValue({
    status: "COMPLETED",
    birthDate: "1998-03-01",
    monthlySalaryManwon: 250,
    monthlySavingManwon: 100,
    netWorthManwon: 1950,
    goalPeriodMonths: 16,
  }),
  patchOnboardingProfile: vi.fn().mockResolvedValue({}),
}));

import { patchOnboardingProfile } from "@/lib/onboarding";
import { GoalDetail } from "./goal-detail";

describe("GoalDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("목표 현황을 제목·게이지·스탯 카드로 렌더한다", () => {
    render(<GoalDetail />);

    expect(screen.getByText("5,000만원 모으기")).toBeInTheDocument();
    expect(screen.getByText("1,950만원")).toBeInTheDocument();
    expect(screen.getByText("39%")).toBeInTheDocument();
    expect(screen.getByText("8개월째")).toBeInTheDocument();
    expect(screen.getByText("D-486")).toBeInTheDocument();
  });

  it("서버 달성률이 100이어도 전체 목표금액 기준으로 달성률을 다시 계산한다", () => {
    render(<GoalDetail />);

    expect(screen.getByText("5,000만원 모으기")).toBeInTheDocument();
    expect(screen.getByText("39%")).toBeInTheDocument();
  });

  it("현재 저축액 입력 버튼이 시트를 연다", () => {
    render(<GoalDetail />);

    fireEvent.click(screen.getByRole("button", { name: "현재 저축액 입력" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("목표수정 시트에서 전체 목표금액을 추가 목표액으로 환산해 저장한다", async () => {
    render(<GoalDetail />);

    fireEvent.click(screen.getByRole("button", { name: /수정/ }));
    expect(screen.getByRole("dialog", { name: "수정" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "목표 금액만원" })).toHaveValue("5000");
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "목표 기간개월" })).toHaveValue("16"),
    );
    expect(screen.getByRole("textbox", { name: "월소득만원" })).toHaveValue("250");

    fireEvent.change(screen.getByRole("textbox", { name: "목표 금액만원" }), {
      target: { value: "6000" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "월소득만원" }), {
      target: { value: "700" },
    });
    fireEvent.click(screen.getByRole("button", { name: "완료" }));

    expect(mutation.mutate).toHaveBeenCalledWith(
      { targetAmountManwon: 4050, periodMonths: 16 },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );

    const [, options] = mutation.mutate.mock.calls.at(-1) ?? [];
    await options.onSuccess();
    expect(patchOnboardingProfile).toHaveBeenCalledWith({
      goalPeriodMonths: 16,
      monthlySalaryManwon: 650,
    });
  });
});
