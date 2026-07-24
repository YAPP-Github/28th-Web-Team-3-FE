import type { Mission } from "@repo/schema/mission";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const MOCK_MISSIONS: Mission[] = [
  {
    id: "m1",
    source: "RECOMMENDED",
    category: "MEAL",
    title: "이번 주 배달음식 2회 이하로 주문",
    targetCount: 2,
    targetUnit: "TIMES_PER_WEEK",
    estimatedSavingsWon: 5000,
    savingsEstimateVersion: "V1",
    savingsLabel: "약 5,000원 절약 예상",
    status: "ACTIVE",
    weekEndsAt: "2099-01-01T00:00:00Z",
  },
  {
    id: "m2",
    source: "RECOMMENDED",
    category: "TRANSPORT",
    title: "가까운 거리 걸어다니기 1회",
    targetCount: 1,
    targetUnit: "TIMES_PER_WEEK",
    estimatedSavingsWon: 3000,
    savingsEstimateVersion: "V1",
    savingsLabel: "약 3,000원 절약 예상",
    status: "ACTIVE",
    weekEndsAt: "2099-01-01T00:00:00Z",
  },
  {
    id: "m3",
    source: "RECOMMENDED",
    category: "HOBBY",
    title: "취미 구독 점검하기",
    targetCount: 1,
    targetUnit: "TIMES_PER_WEEK",
    estimatedSavingsWon: 4000,
    savingsEstimateVersion: "V1",
    savingsLabel: "약 4,000원 절약 예상",
    status: "ACTIVE",
    weekEndsAt: "2099-01-01T00:00:00Z",
  },
];

const mutation = { isPending: false, mutate: vi.fn() };
let mockData: Mission[] = MOCK_MISSIONS;

vi.mock("@/app/(tabs)/mission/queries", () => ({
  useMissions: () => ({ data: mockData, isPending: false, isError: false }),
  useCompleteMission: () => mutation,
}));

vi.mock("@/app/goal/queries", () => ({
  useGoalStatus: () => ({
    data: {
      targetAmountManwon: 3050,
      totalSavedManwon: 1950,
      progressPercent: 100,
      usageMonths: 8,
      deadlineDDay: 486,
      thisMonth: { targetManwon: 82, savedManwon: 67, progressPercent: 82, dDay: 12 },
    },
  }),
}));

import { WeeklyMissionSection } from "./weekly-mission-section";

describe("WeeklyMissionSection", () => {
  it("조회한 미션을 그리고 카테고리로 필터링한다", () => {
    mockData = MOCK_MISSIONS;
    render(<WeeklyMissionSection />);

    expect(screen.getByText(/\d+% 달성/)).toBeInTheDocument();
    expect(screen.getByText("이번 주 배달음식 2회 이하로 주문")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "교통" }));
    expect(screen.getByText("가까운 거리 걸어다니기 1회")).toBeInTheDocument();
    expect(screen.queryByText("이번 주 배달음식 2회 이하로 주문")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "취미" }));
    expect(screen.getByText("취미 구독 점검하기")).toBeInTheDocument();
  });

  it("미션이 없으면 추가 CTA를 표시한다", () => {
    mockData = [];
    render(<WeeklyMissionSection />);

    expect(screen.getByText("0% 달성")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "5,000만원 달성을 위한 미션 추가" })).toHaveAttribute(
      "href",
      "/mission/new",
    );
  });

  it("체크 아이콘 확인 모달에서 완료를 요청한다", () => {
    mockData = MOCK_MISSIONS;
    render(<WeeklyMissionSection />);

    const [completeButton] = screen.getAllByRole("button", { name: "미션 완료" });
    if (!completeButton) throw new Error("미션 완료 버튼을 찾을 수 없습니다.");
    fireEvent.click(completeButton);
    expect(screen.getByRole("dialog", { name: "미션을 완료할까요?" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "완료" }));
    expect(mutation.mutate).toHaveBeenCalledWith(
      { source: "RECOMMENDED", missionId: "m1" },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });
});
