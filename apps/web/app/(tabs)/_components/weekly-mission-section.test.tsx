import type { Mission } from "@repo/schema/mission";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchGoalStatus } from "@/api/goal";
import { completeMission, fetchMissions } from "@/api/mission";
import { hasStartedMissionCreation } from "@/app/mission/new/utils/mission-creation-history";
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
    category: "LIVING",
    title: "생활용품 구매 미루기",
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

function filterMissions(params: Parameters<typeof fetchMissions>[0] = {}) {
  return mockData.filter(
    (mission) =>
      (!params.status || mission.status === params.status) &&
      (!params.category || mission.category === params.category),
  );
}

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

vi.mock("./pigbox-progress-gauge", () => ({
  PigboxProgressGauge: ({ playRequest, progress }: { playRequest?: number; progress: number }) => (
    <div data-pigbox-play-request={playRequest} data-pigbox-progress={Math.round(progress)} />
  ),
}));

vi.mock("@/app/mission/new/utils/mission-creation-history", () => ({
  hasStartedMissionCreation: vi.fn(),
}));

import { WeeklyMissionSection } from "./weekly-mission-section";

describe("WeeklyMissionSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchMissions).mockImplementation((params) =>
      Promise.resolve(filterMissions(params)),
    );
    vi.mocked(completeMission).mockResolvedValue(undefined);
    vi.mocked(fetchGoalStatus).mockResolvedValue(MOCK_GOAL_STATUS);
    vi.mocked(hasStartedMissionCreation).mockResolvedValue(false);
  });

  it("조회한 미션을 그리고 카테고리로 필터링한다", async () => {
    mockData = MOCK_MISSIONS;
    const { container } = render(<WeeklyMissionSection />);

    expect(await screen.findByText(/\d+% 달성/)).toBeInTheDocument();
    expect(container.querySelector('[data-pigbox-progress="0"]')).toBeInTheDocument();
    expect(screen.getByText("이번 주 배달음식 2회 이하로 주문")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "교통" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "생활" }));
    await waitFor(() =>
      expect(screen.queryByText("이번 주 배달음식 2회 이하로 주문")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("생활용품 구매 미루기")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "취미" }));
    expect(await screen.findByText("취미 구독 점검하기")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("생활용품 구매 미루기")).not.toBeInTheDocument());
  });

  it("카테고리 조회 중에는 직전 목록을 placeholder로 유지한다", async () => {
    mockData = MOCK_MISSIONS;
    vi.mocked(fetchMissions).mockImplementation((params) =>
      params?.category === "LIVING"
        ? new Promise(() => {})
        : Promise.resolve(filterMissions(params)),
    );
    const { container } = render(<WeeklyMissionSection />);

    expect(await screen.findByText("이번 주 배달음식 2회 이하로 주문")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "생활" }));

    expect(screen.getByText("이번 주 배달음식 2회 이하로 주문")).toBeInTheDocument();
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    expect(screen.queryByText("미션을 불러오는 중")).not.toBeInTheDocument();
  });

  it("모든 미션을 완료하면 진행률과 게이지를 100%로 표시한다", async () => {
    mockData = [
      {
        id: "completed-1",
        source: "RECOMMENDED",
        category: "LIVING",
        title: "사용하지 않는 구독 정리하기",
        targetCount: 1,
        targetUnit: "TIMES_PER_WEEK",
        estimatedSavingsWon: 30_000,
        savingsEstimateVersion: "V1",
        savingsLabel: "약 3만원 절약 예상",
        status: "COMPLETED",
        weekEndsAt: "2099-01-01T00:00:00Z",
      },
    ];
    const { container } = render(<WeeklyMissionSection />);

    expect(await screen.findByText("100% 달성")).toBeInTheDocument();
    expect(screen.getByText("약 3만원 절약했어요")).toBeInTheDocument();
    expect(container.querySelector('[data-pigbox-progress="100"]')).toBeInTheDocument();
  });

  it("첫 미션 생성 전에는 추천받기 CTA만 표시한다", async () => {
    mockData = [];
    render(<WeeklyMissionSection />);

    expect(await screen.findByText("0% 달성")).toBeInTheDocument();
    expect(screen.getByText("약 0원 절약했어요")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "5,000만원 달성을 위한 미션 추천 받기" }),
    ).toHaveAttribute("href", "/mission/new");
    expect(screen.queryByRole("link", { name: "직접 입력" })).not.toBeInTheDocument();
  });

  it("미션 생성 이력을 확인하는 동안에는 CTA 대신 자리를 유지한다", async () => {
    mockData = [];
    vi.mocked(hasStartedMissionCreation).mockReturnValue(new Promise(() => {}));
    const { container } = render(<WeeklyMissionSection />);

    await screen.findByText("0% 달성");
    expect(screen.queryByRole("link", { name: /미션 추천 받기/ })).not.toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="mission-creation-history-skeleton"]'),
    ).toBeInTheDocument();
  });

  it("미션 추천 생성을 시작한 뒤에는 직접 입력과 추천받기를 모두 표시한다", async () => {
    mockData = [];
    vi.mocked(hasStartedMissionCreation).mockResolvedValue(true);
    render(<WeeklyMissionSection />);

    expect(await screen.findByRole("link", { name: "직접 입력" })).toHaveAttribute(
      "href",
      "/mission/new/manual",
    );
    expect(screen.getByRole("link", { name: "추천받기" })).toHaveAttribute("href", "/mission/new");
  });

  it("미션이 3개보다 많으면 페이지를 나눠 홈 높이를 유지한다", async () => {
    mockData = [...MOCK_MISSIONS, { ...MOCK_MISSIONS[0]!, id: "m4", title: "네 번째 미션" }];
    render(<WeeklyMissionSection />);

    expect(await screen.findByText("1/2")).toBeInTheDocument();
    expect(screen.queryByText("네 번째 미션")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "다음 미션 페이지" }));
    expect(screen.getByText("2/2")).toBeInTheDocument();
    expect(screen.getByText("네 번째 미션")).toBeInTheDocument();
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
    expect(screen.getByText("달성 시")).toBeInTheDocument();
    expect(screen.getByText("예상 절약 금액이 없는 직접 추가 미션이에요.")).toBeInTheDocument();
  });

  it("체크 아이콘 확인 모달에서 완료를 요청한다", async () => {
    mockData = MOCK_MISSIONS;
    const { container } = render(<WeeklyMissionSection />);

    await screen.findByText(/\d+% 달성/);
    expect(container.querySelector("[data-pigbox-play-request]")).toHaveAttribute(
      "data-pigbox-play-request",
      "0",
    );
    const [completeButton] = screen.getAllByRole("button", { name: "미션 완료" });
    if (!completeButton) throw new Error("미션 완료 버튼을 찾을 수 없습니다.");
    fireEvent.click(completeButton);
    expect(screen.getByRole("dialog", { name: "미션을 완료할까요?" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "완료" }));
    await waitFor(() => expect(completeMission).toHaveBeenCalledWith("RECOMMENDED", "m1"));
    await waitFor(() =>
      expect(container.querySelector("[data-pigbox-play-request]")).toHaveAttribute(
        "data-pigbox-play-request",
        "1",
      ),
    );
  });
});
