import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchGoalStatus } from "@/api/goal";
import { fetchMissions } from "@/api/mission";
import { fetchPolicies } from "@/api/policy";
import { MOCK_GOAL_STATUS } from "@/lib/test/fixtures/goal-status";
import { render, screen } from "@/lib/test/react";
import HomePage from "./page";

vi.mock("@/api/goal", () => ({
  fetchGoalStatus: vi.fn(),
  updateGoal: vi.fn(),
  updateSavings: vi.fn(),
}));

vi.mock("@/api/mission", () => ({
  completeMission: vi.fn(),
  deleteMission: vi.fn(),
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
    vi.mocked(fetchMissions).mockResolvedValue([]);
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

  it("Figma 홈의 목표·팁 섹션을 렌더한다", async () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: "홈" })).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: /5,000만원 모으기/ })).toHaveAttribute(
      "href",
      "/goal",
    );
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
