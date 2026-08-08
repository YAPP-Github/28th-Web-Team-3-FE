import type { Mission } from "@repo/schema/mission";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchGoalStatus } from "@/api/goal";
import { completeMission, fetchMissions } from "@/api/mission";
import { MOCK_GOAL_STATUS } from "@/lib/test/fixtures/goal-status";
import { fireEvent, render, screen, waitFor } from "@/lib/test/react";

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

let mockData: Mission[] = MOCK_MISSIONS;

vi.mock("@/api/mission", () => ({
  completeMission: vi.fn(),
  deleteRecommendedMission: vi.fn(),
  fetchMissions: vi.fn(),
}));

vi.mock("@/api/goal", () => ({
  fetchGoalStatus: vi.fn(),
  updateGoal: vi.fn(),
  updateSavings: vi.fn(),
}));

import { WeeklyMissionSection } from "./weekly-mission-section";

describe("WeeklyMissionSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchMissions).mockImplementation(() => Promise.resolve(mockData));
    vi.mocked(completeMission).mockResolvedValue(undefined);
    vi.mocked(fetchGoalStatus).mockResolvedValue(MOCK_GOAL_STATUS);
  });

  it("조회한 미션을 그리고 카테고리로 필터링한다", async () => {
    mockData = MOCK_MISSIONS;
    render(<WeeklyMissionSection />);

    expect(await screen.findByText(/\d+% 달성/)).toBeInTheDocument();
    expect(screen.getByText("이번 주 배달음식 2회 이하로 주문")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "교통" }));
    expect(screen.getByText("가까운 거리 걸어다니기 1회")).toBeInTheDocument();
    expect(screen.queryByText("이번 주 배달음식 2회 이하로 주문")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "취미" }));
    expect(screen.getByText("취미 구독 점검하기")).toBeInTheDocument();
  });

  it("미션이 없으면 추가 CTA를 표시한다", async () => {
    mockData = [];
    render(<WeeklyMissionSection />);

    expect(await screen.findByText("0% 달성")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "5,000만원 달성을 위한 미션 추가" })).toHaveAttribute(
      "href",
      "/mission/new",
    );
  });

  it("절약 추정값이 없는 수동 미션에는 대체 설명을 표시한다", async () => {
    mockData = [
      {
        id: "manual-1",
        source: "MANUAL",
        category: "LIVING",
        title: "사용하지 않는 구독 정리하기",
        status: "ACTIVE",
        weekEndsAt: "2099-01-01T00:00:00Z",
      },
    ];
    render(<WeeklyMissionSection />);

    fireEvent.click(await screen.findByRole("button", { name: "사용하지 않는 구독 정리하기" }));
    expect(screen.getByText("직접 추가")).toBeInTheDocument();
    expect(screen.getByText("예상 절약 금액이 없는 직접 추가 미션이에요.")).toBeInTheDocument();
  });

  it("체크 아이콘 확인 모달에서 완료를 요청한다", async () => {
    mockData = MOCK_MISSIONS;
    render(<WeeklyMissionSection />);

    await screen.findByText(/\d+% 달성/);
    const [completeButton] = screen.getAllByRole("button", { name: "미션 완료" });
    if (!completeButton) throw new Error("미션 완료 버튼을 찾을 수 없습니다.");
    fireEvent.click(completeButton);
    expect(screen.getByRole("dialog", { name: "미션을 완료할까요?" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "완료" }));
    await waitFor(() => expect(completeMission).toHaveBeenCalledWith("RECOMMENDED", "m1"));
  });
});
