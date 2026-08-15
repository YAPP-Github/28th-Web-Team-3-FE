import type { Mission } from "@repo/schema/mission";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchGoalStatus } from "@/api/goal";
import { completeMission, fetchMissions } from "@/api/mission";
import { fetchPolicies } from "@/api/policy";
import { MOCK_GOAL_STATUS } from "@/lib/test/fixtures/goal-status";
import { render, screen } from "@/lib/test/react";
import HomePage from "./page";

const MOCK_MISSIONS: Mission[] = [
  {
    id: "meal-1",
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
];

vi.mock("@/api/goal", () => ({
  fetchGoalStatus: vi.fn(),
  updateGoal: vi.fn(),
  updateSavings: vi.fn(),
}));

vi.mock("@/api/mission", () => ({
  completeMission: vi.fn(),
  deleteRecommendedMission: vi.fn(),
  fetchMissions: vi.fn(),
}));

vi.mock("@/api/policy", () => ({
  bookmarkPolicy: vi.fn(),
  fetchPolicies: vi.fn(),
  fetchPolicyDetail: vi.fn(),
  unbookmarkPolicy: vi.fn(),
}));

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchGoalStatus).mockResolvedValue(MOCK_GOAL_STATUS);
    vi.mocked(fetchMissions).mockResolvedValue(MOCK_MISSIONS);
    vi.mocked(completeMission).mockResolvedValue(undefined);
    vi.mocked(fetchPolicies).mockResolvedValue([
      {
        id: 1,
        title: "청년 정책",
        category: "금융",
        largeCategory: null,
        description: "청년을 위한 금융 혜택",
        bookmarked: false,
      },
    ]);
  });

  it("Figma 홈의 목표·미션·팁 섹션을 렌더한다", async () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: "홈" })).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: /5,000만원 모으기/ })).toHaveAttribute(
      "href",
      "/goal",
    );
    expect(screen.getByRole("heading", { name: "이번 주 미션" })).toBeInTheDocument();
    expect(screen.getByText("이번 주 배달음식 2회 이하로 주문")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "눈여겨볼 만한 혜택/팁" })).toBeInTheDocument();
  });

  it("목표 조회 실패 시 사용자용 오류 문구를 렌더한다", async () => {
    const error = new Error("goal request failed");
    vi.mocked(fetchGoalStatus).mockRejectedValue(error);

    render(<HomePage />);

    expect(
      await screen.findByText("목표를 불러오지 못했어요. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });
});
