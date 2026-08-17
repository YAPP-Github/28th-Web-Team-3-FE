import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchMissionHistories } from "@/api/mission";
import { fireEvent, render, screen } from "@/lib/test/react";
import { MissionHistory } from "./mission-history";

const navigation = vi.hoisted(() => ({ back: vi.fn(), replace: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => navigation }));

vi.mock("@/api/mission", () => ({
  completeMission: vi.fn(),
  createManualMission: vi.fn(),
  deleteRecommendedMission: vi.fn(),
  fetchMissionHistories: vi.fn(),
  fetchMissions: vi.fn(),
}));

vi.mock("@/app/(tabs)/_components/pigbox-progress-gauge", () => ({
  PigboxProgressGauge: ({
    animated,
    playRequest,
    progress,
  }: {
    animated?: boolean;
    playRequest?: number;
    progress: number;
  }) => (
    <span
      data-animated={String(animated)}
      data-play-request={playRequest}
      data-progress={progress}
    />
  ),
}));

vi.mock("../lib/month", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../lib/month")>()),
  getCurrentYearMonth: () => ({ month: 8, year: 2026 }),
}));

describe("MissionHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchMissionHistories).mockResolvedValue([
      {
        completedCount: 0,
        isCurrentWeek: false,
        totalCount: 0,
        weekEndDate: "2026-08-16",
        weekOfMonth: 2,
        weekStartDate: "2026-08-10",
      },
      {
        completedCount: 1,
        isCurrentWeek: true,
        totalCount: 4,
        weekEndDate: "2026-08-23",
        weekOfMonth: 3,
        weekStartDate: "2026-08-17",
      },
    ]);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("현재 달의 주차별 미션 내역을 서버 완료 수로 표시한다", async () => {
    const { container } = render(<MissionHistory />);

    expect(await screen.findByText("25% 달성")).toBeInTheDocument();
    expect(screen.getByText("2026년 8월")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "2주차" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "3주차" })).toBeInTheDocument();
    expect(screen.getByText("미션이 없었어요.")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "2주차 저금통 애니메이션 재생" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("현재 진행 중")).toBeInTheDocument();
    expect(screen.getByText("+ 1")).toBeInTheDocument();
    expect(container.querySelector('[data-progress="25"]')).toHaveAttribute(
      "data-animated",
      "false",
    );
  });

  it("과거 달의 주차별 내역을 요청하고 현재 달 이후 이동은 막는다", async () => {
    render(<MissionHistory />);
    await screen.findByText("25% 달성");

    const nextButton = screen.getByRole("button", { name: "다음 달" });
    expect(nextButton).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "이전 달" }));

    expect(screen.getByText("2026년 7월")).toBeInTheDocument();
    expect(vi.mocked(fetchMissionHistories)).toHaveBeenLastCalledWith({ month: 7, year: 2026 });

    fireEvent.click(nextButton);
    expect(screen.getByText("2026년 8월")).toBeInTheDocument();
    expect(nextButton).toBeDisabled();
  });

  it("저금통을 누를 때만 기존 애니메이션의 1회 재생을 요청한다", async () => {
    const { container } = render(<MissionHistory />);
    const pigButton = await screen.findByRole("button", {
      name: "3주차 저금통 애니메이션 재생",
    });
    const gauge = container.querySelector('[data-progress="25"]');

    expect(gauge).toHaveAttribute("data-play-request", "0");
    fireEvent.click(pigButton);

    expect(gauge).toHaveAttribute("data-play-request", "1");
  });

  it("딥링크로 열었을 때 뒤로가기는 미션 홈으로 이동한다", async () => {
    window.history.replaceState(null, "", "/mission/history");
    render(<MissionHistory />);
    await screen.findByText("25% 달성");

    fireEvent.click(screen.getByRole("button", { name: "뒤로가기" }));

    expect(navigation.replace).toHaveBeenCalledWith("/mission");
  });
});
