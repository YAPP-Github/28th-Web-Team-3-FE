import type { GoalStatus } from "@repo/schema/goal";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// 조회/변경 훅을 목으로 대체한다 — 데이터 주입 후 렌더·인터랙션 로직을 검증한다.
// (API 연동 자체는 브라우저 MSW로 별도 확인. vitest jsdom은 msw/node fetch를 가로채지 못한다.)
const MOCK_GOAL: GoalStatus = {
  targetAmountManwon: 5000,
  totalSavedManwon: 1950,
  progressPercent: 39,
  usageMonths: 8,
  deadlineDDay: 486,
  thisMonth: { targetManwon: 82, savedManwon: 67, progressPercent: 82, dday: 12 },
};

const mutation = { mutate: vi.fn(), isPending: false };

vi.mock("../queries", () => ({
  useGoalStatus: () => ({ data: MOCK_GOAL, isPending: false, isError: false }),
  useUpdateSavings: () => mutation,
  useUpdateGoal: () => mutation,
}));

import { GoalDetail } from "./goal-detail";

describe("GoalDetail", () => {
  it("목표 현황을 제목·게이지·스탯 카드로 렌더한다", () => {
    render(<GoalDetail />);

    expect(screen.getByText("5,000만원 모으기")).toBeInTheDocument();
    expect(screen.getByText("1,950만원")).toBeInTheDocument();
    expect(screen.getByText("39%")).toBeInTheDocument();
    expect(screen.getByText("8개월째")).toBeInTheDocument();
    expect(screen.getByText("D-486")).toBeInTheDocument();
  });

  it("현재 저축액 입력 버튼이 시트를 연다", () => {
    render(<GoalDetail />);

    fireEvent.click(screen.getByRole("button", { name: "현재 저축액 입력" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
