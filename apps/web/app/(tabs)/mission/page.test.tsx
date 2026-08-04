import type { Mission } from "@repo/schema/mission";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { completeMission, deleteRecommendedMission, fetchMissions } from "@/api/mission";
import { fireEvent, render, screen, waitFor } from "@/lib/test/react";

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
    targetCount: 1,
    targetUnit: "TIMES_PER_WEEK",
    estimatedSavingsWon: 15000,
    savingsEstimateVersion: "V1",
    savingsLabel: "약 15,000원 절약 예상",
    status: "COMPLETED",
    weekEndsAt: "2099-01-01T00:00:00Z",
  },
];

vi.mock("@/api/mission", () => ({
  completeMission: vi.fn(),
  deleteRecommendedMission: vi.fn(),
  fetchMissions: vi.fn(),
}));

import MissionPage from "./page";

describe("MissionPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchMissions).mockResolvedValue(MOCK_MISSIONS);
    vi.mocked(completeMission).mockResolvedValue(undefined);
    vi.mocked(deleteRecommendedMission).mockResolvedValue(undefined);
  });

  it("절약 금액은 완료한 미션에서만 나온다", async () => {
    render(<MissionPage />);

    // 목 데이터는 3건 중 15,000원짜리 1건만 완료 — 진행률과 절약 금액이 같은 데이터에서 나온다.
    expect(await screen.findByText("33% 달성")).toBeInTheDocument();
    expect(screen.getByText("약 2만원 절약했어요")).toBeInTheDocument();
  });

  it("카테고리를 필터링하고 미션 상세를 펼친다", async () => {
    render(<MissionPage />);

    await screen.findByText("33% 달성");
    fireEvent.click(screen.getByRole("tab", { name: "식비" }));
    expect(screen.getByText("이번 주 배달음식 2회 이하로 주문")).toBeInTheDocument();
    expect(screen.queryByText("가까운 거리 걸어다니기 1회")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /이번 주 배달음식/ }));
    expect(screen.getByText("약 5,000원 절약 예상")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "교통" }));
    expect(screen.queryByText("불필요한 구독 해지 1회")).not.toBeInTheDocument();
  });

  it("체크 아이콘 확인 모달에서 완료를 요청한다", async () => {
    render(<MissionPage />);

    await screen.findByText("33% 달성");
    fireEvent.click(screen.getByRole("tab", { name: "식비" }));
    fireEvent.click(screen.getByRole("button", { name: "미션 완료" }));
    expect(screen.getByRole("dialog", { name: "미션을 완료할까요?" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "완료" }));
    await waitFor(() => expect(completeMission).toHaveBeenCalledWith("RECOMMENDED", "meal-1"));
  });

  it("펼친 추천 미션에서 삭제를 요청한다", async () => {
    render(<MissionPage />);

    await screen.findByText("33% 달성");
    fireEvent.click(screen.getByRole("tab", { name: "식비" }));
    fireEvent.click(screen.getByRole("button", { name: /이번 주 배달음식/ }));
    fireEvent.click(screen.getByRole("button", { name: "미션 삭제" }));

    await waitFor(() => expect(deleteRecommendedMission).toHaveBeenCalledWith("meal-1"));
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
    vi.mocked(deleteRecommendedMission).mockRejectedValue(new Error("network error"));
    render(<MissionPage />);

    await screen.findByText("33% 달성");
    fireEvent.click(screen.getByRole("tab", { name: "식비" }));
    fireEvent.click(screen.getByRole("button", { name: /이번 주 배달음식/ }));
    fireEvent.click(screen.getByRole("button", { name: "미션 삭제" }));

    expect(
      await screen.findByText("미션을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });

  it("플로팅 버튼으로 미션 추가 메뉴를 연다", async () => {
    render(<MissionPage />);

    await screen.findByText("33% 달성");
    fireEvent.click(screen.getByRole("button", { name: "미션 추가 메뉴 열기" }));
    expect(screen.getByRole("link", { name: "추천받기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "직접입력 (준비 중)" })).toBeDisabled();
  });

  it("추천받기를 새 미션 생성 경로로 연결한다", async () => {
    render(<MissionPage />);

    await screen.findByText("33% 달성");
    fireEvent.click(screen.getByRole("button", { name: "미션 추가 메뉴 열기" }));
    expect(screen.getByRole("link", { name: "추천받기" })).toHaveAttribute("href", "/mission/new");
  });
});
