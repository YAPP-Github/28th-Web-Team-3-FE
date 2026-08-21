import type { Mission } from "@repo/schema/mission";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { completeMission, deleteMission, fetchMissions } from "@/api/mission";
import { fireEvent, render, screen, waitFor } from "@/lib/test/react";

const MOCK_MISSIONS: Mission[] = [
  {
    id: "meal-1",
    source: "RECOMMENDED",
    category: "MEAL",
    title: "이번 주 배달음식 2회 이하로 주문",
    targetCount: 2,
    targetUnit: "TIMES_PER_WEEK",
    estimatedSavingsWon: 33_000,
    savingsEstimateVersion: "V1",
    savingsLabel: "약 33000원 절약 예상",
    status: "ACTIVE",
    weekEndsAt: "2099-01-01T00:00:00Z",
  },
  {
    id: "transport-1",
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
    id: "living-1",
    source: "MANUAL",
    category: "LIVING",
    title: "불필요한 구독 해지 1회",
    status: "COMPLETED",
    weekEndsAt: "2099-01-01T00:00:00Z",
  },
];

vi.mock("@/api/mission", () => ({
  completeMission: vi.fn(),
  deleteMission: vi.fn(),
  fetchMissions: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

vi.mock("@/app/(tabs)/_components/pigbox-progress-gauge", () => ({
  PigboxProgressGauge: ({ playRequest, progress }: { playRequest?: number; progress: number }) => (
    <div data-pigbox-play-request={playRequest} data-pigbox-progress={Math.round(progress)} />
  ),
}));

import MissionPage from "./page";

describe("MissionPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchMissions).mockResolvedValue(MOCK_MISSIONS);
    vi.mocked(completeMission).mockResolvedValue(undefined);
    vi.mocked(deleteMission).mockResolvedValue(undefined);
  });

  it("달성률과 완료 미션의 절약액을 요약한다", async () => {
    const { container } = render(<MissionPage />);

    expect(await screen.findByText("33% 달성")).toBeInTheDocument();
    expect(screen.getByText("약 0원 절약했어요")).toBeInTheDocument();
    expect(container.querySelector('[data-pigbox-progress="33"]')).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "내역" })).toHaveAttribute("href", "/mission/history");
  });

  it("미션이 하나도 없으면 필터와 목록 제목 없이 빈 상태를 표시한다", async () => {
    vi.mocked(fetchMissions).mockResolvedValue([]);
    render(<MissionPage />);

    expect(await screen.findByText("0% 달성")).toHaveClass("text-gray-900");
    expect(screen.getByText("약 0원 절약했어요")).toBeInTheDocument();
    expect(
      screen.getByText((_, element) =>
        Boolean(
          element?.tagName === "P" &&
            element.textContent === "미션이 없어요.절약 미션을 추가하고 달성해보세요.",
        ),
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "진행 중" })).not.toBeInTheDocument();
  });

  it("카테고리를 필터링하고 미션 상세를 펼친다", async () => {
    render(<MissionPage />);

    await screen.findByText("33% 달성");
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "전체",
      "식비",
      "생활",
      "취미",
    ]);
    expect(screen.queryByRole("tab", { name: "교통" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "식비" }));
    expect(screen.getByText("이번 주 배달음식 2회 이하로 주문")).toBeInTheDocument();
    expect(screen.queryByText("가까운 거리 걸어다니기 1회")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /이번 주 배달음식/ }));
    expect(screen.getByText("약 33,000원 절약 예상")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "생활" }));
    expect(screen.getByText("불필요한 구독 해지 1회")).toBeInTheDocument();
  });

  it("직접 입력한 미션 카드도 조건 라벨을 달성 시로 표시한다", async () => {
    vi.mocked(fetchMissions).mockResolvedValue([
      {
        id: "manual-active-1",
        source: "MANUAL",
        category: "LIVING",
        title: "무지출 데이 만들기",
        status: "ACTIVE",
        weekEndsAt: "2099-01-01T00:00:00Z",
      },
    ]);
    render(<MissionPage />);

    fireEvent.click(await screen.findByRole("button", { name: "무지출 데이 만들기" }));

    expect(screen.getByText("달성 시")).toBeInTheDocument();
    expect(screen.queryByText("직접 추가")).not.toBeInTheDocument();
  });

  it("체크 아이콘 확인 모달에서 완료를 요청한다", async () => {
    const { container } = render(<MissionPage />);

    await screen.findByText("33% 달성");
    expect(container.querySelector("[data-pigbox-play-request]")).toHaveAttribute(
      "data-pigbox-play-request",
      "0",
    );
    fireEvent.click(screen.getByRole("tab", { name: "식비" }));
    fireEvent.click(screen.getByRole("button", { name: "미션 완료" }));
    expect(screen.getByRole("dialog", { name: "미션을 완료할까요?" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "완료" }));
    await waitFor(() => expect(completeMission).toHaveBeenCalledWith("RECOMMENDED", "meal-1"));
    await waitFor(() =>
      expect(container.querySelector("[data-pigbox-play-request]")).toHaveAttribute(
        "data-pigbox-play-request",
        "1",
      ),
    );
  });

  it("펼친 추천 미션의 삭제를 확인한 뒤 요청한다", async () => {
    render(<MissionPage />);

    await screen.findByText("33% 달성");
    fireEvent.click(screen.getByRole("tab", { name: "식비" }));
    fireEvent.click(screen.getByRole("button", { name: /이번 주 배달음식/ }));
    fireEvent.click(screen.getByRole("button", { name: "미션 삭제" }));
    expect(screen.getByRole("dialog", { name: "미션을 삭제할까요?" })).toBeInTheDocument();
    expect(deleteMission).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "삭제" }));

    await waitFor(() => expect(deleteMission).toHaveBeenCalledWith("RECOMMENDED", "meal-1"));
  });

  it("펼친 직접 입력 미션의 삭제를 확인한 뒤 요청한다", async () => {
    vi.mocked(fetchMissions).mockResolvedValue([
      {
        id: "manual-active-1",
        source: "MANUAL",
        category: "LIVING",
        title: "무지출 데이 만들기",
        status: "ACTIVE",
        weekEndsAt: "2099-01-01T00:00:00Z",
      },
    ]);
    render(<MissionPage />);

    fireEvent.click(await screen.findByRole("button", { name: "무지출 데이 만들기" }));
    fireEvent.click(screen.getByRole("button", { name: "미션 삭제" }));
    fireEvent.click(screen.getByRole("button", { name: "삭제" }));

    await waitFor(() => expect(deleteMission).toHaveBeenCalledWith("MANUAL", "manual-active-1"));
  });

  it("삭제 확인을 취소하면 요청하지 않는다", async () => {
    render(<MissionPage />);

    await screen.findByText("33% 달성");
    fireEvent.click(screen.getByRole("tab", { name: "식비" }));
    fireEvent.click(screen.getByRole("button", { name: /이번 주 배달음식/ }));
    fireEvent.click(screen.getByRole("button", { name: "미션 삭제" }));
    fireEvent.click(screen.getByRole("button", { name: "취소" }));

    expect(screen.queryByRole("dialog", { name: "미션을 삭제할까요?" })).not.toBeInTheDocument();
    expect(deleteMission).not.toHaveBeenCalled();
  });

  it("완료 요청이 실패하면 다이얼로그를 열어둔 채 오류를 보여준다", async () => {
    vi.mocked(completeMission).mockRejectedValue(new Error("network error"));
    render(<MissionPage />);

    await screen.findByText("33% 달성");
    fireEvent.click(screen.getByRole("tab", { name: "식비" }));
    fireEvent.click(screen.getByRole("button", { name: "미션 완료" }));
    fireEvent.click(screen.getByRole("button", { name: "완료" }));

    // 실패했는데 다이얼로그가 닫히면 사용자는 완료된 줄 안다.
    expect(
      await screen.findByText("완료 처리하지 못했어요. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "미션을 완료할까요?" })).toBeInTheDocument();
  });

  it("삭제 요청이 실패하면 오류를 보여준다", async () => {
    vi.mocked(deleteMission).mockRejectedValue(new Error("network error"));
    render(<MissionPage />);

    await screen.findByText("33% 달성");
    fireEvent.click(screen.getByRole("tab", { name: "식비" }));
    fireEvent.click(screen.getByRole("button", { name: /이번 주 배달음식/ }));
    fireEvent.click(screen.getByRole("button", { name: "미션 삭제" }));
    fireEvent.click(screen.getByRole("button", { name: "삭제" }));

    expect(
      await screen.findByText("미션을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "미션을 삭제할까요?" })).toBeInTheDocument();
  });

  it("플로팅 버튼으로 미션 추가 메뉴를 연다", async () => {
    render(<MissionPage />);

    await screen.findByText("33% 달성");
    const openButton = screen.getByRole("button", { name: "미션 추가 메뉴 열기" });
    fireEvent.click(openButton);

    expect(screen.getByRole("link", { name: "추천받기" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "직접입력" })).toHaveAttribute(
      "href",
      "/mission/new/manual",
    );
    expect(openButton).toHaveClass("rotate-45", "bg-gray-0");

    fireEvent.click(screen.getByRole("button", { name: "미션 추가 메뉴 닫기" }));
    expect(screen.queryByRole("link", { name: "추천받기" })).not.toBeInTheDocument();
    expect(openButton).toHaveClass("rotate-0", "bg-blue-500");
  });

  // 상단 safe-area 밴드는 경로만 보고 gray-50을 깐다. 로딩도 히어로 자리를 남겨야
  // 밴드와 본문이 서로 다른 색으로 끊겨 보이지 않고, 데이터 도착 후 위치도 흔들리지 않는다.
  it("로딩 화면도 미션 히어로와 같은 색으로 시작한다", () => {
    vi.mocked(fetchMissions).mockReturnValue(new Promise(() => {}));
    render(<MissionPage />);

    expect(document.querySelector('[data-slot="mission-hero-skeleton"]')).toHaveClass("bg-gray-50");
  });

  it("오류 화면도 밴드와 같은 색으로 시작한다", async () => {
    vi.mocked(fetchMissions).mockRejectedValue(new Error("network error"));
    render(<MissionPage />);

    await screen.findByText("미션을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
    expect(screen.getByRole("main")).toHaveClass("bg-gray-50");
  });

  it("추천받기를 새 미션 생성 경로로 연결한다", async () => {
    render(<MissionPage />);

    await screen.findByText("33% 달성");
    fireEvent.click(screen.getByRole("button", { name: "미션 추가 메뉴 열기" }));
    expect(screen.getByRole("link", { name: "추천받기" })).toHaveAttribute("href", "/mission/new");
  });
});
