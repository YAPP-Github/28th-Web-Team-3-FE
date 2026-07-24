import type { Mission } from "@repo/schema/mission";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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

const completeMutation = { isPending: false, mutate: vi.fn() };
const deleteMutation = { isPending: false, mutate: vi.fn(), variables: undefined };

vi.mock("./queries", () => ({
  useMissions: () => ({ data: MOCK_MISSIONS, isPending: false, isError: false }),
  useCompleteMission: () => completeMutation,
  useDeleteRecommendedMission: () => deleteMutation,
}));

import MissionPage from "./page";

describe("MissionPage", () => {
  it("카테고리를 필터링하고 미션 상세를 펼친다", () => {
    render(<MissionPage />);

    fireEvent.click(screen.getByRole("tab", { name: "식비" }));
    expect(screen.getByText("이번 주 배달음식 2회 이하로 주문")).toBeInTheDocument();
    expect(screen.queryByText("가까운 거리 걸어다니기 1회")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /이번 주 배달음식/ }));
    expect(screen.getByText("약 5,000원 절약 예상")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "교통" }));
    expect(screen.queryByText("불필요한 구독 해지 1회")).not.toBeInTheDocument();
  });

  it("체크 아이콘 확인 모달에서 완료를 요청한다", () => {
    render(<MissionPage />);

    fireEvent.click(screen.getByRole("tab", { name: "식비" }));
    fireEvent.click(screen.getByRole("button", { name: "미션 완료" }));
    expect(screen.getByRole("dialog", { name: "미션을 완료할까요?" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "완료" }));
    expect(completeMutation.mutate).toHaveBeenCalledWith(
      {
        source: "RECOMMENDED",
        missionId: "meal-1",
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("펼친 추천 미션에서 삭제를 요청한다", () => {
    render(<MissionPage />);

    fireEvent.click(screen.getByRole("tab", { name: "식비" }));
    fireEvent.click(screen.getByRole("button", { name: /이번 주 배달음식/ }));
    fireEvent.click(screen.getByRole("button", { name: "미션 삭제" }));

    expect(deleteMutation.mutate).toHaveBeenCalledWith(
      { missionId: "meal-1" },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("플로팅 버튼으로 미션 추가 메뉴를 연다", () => {
    render(<MissionPage />);

    fireEvent.click(screen.getByRole("button", { name: "미션 추가 메뉴 열기" }));
    expect(screen.getByRole("link", { name: "추천받기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "직접입력 (준비 중)" })).toBeDisabled();
  });

  it("추천받기를 새 미션 생성 경로로 연결한다", () => {
    render(<MissionPage />);

    fireEvent.click(screen.getByRole("button", { name: "미션 추가 메뉴 열기" }));
    expect(screen.getByRole("link", { name: "추천받기" })).toHaveAttribute("href", "/mission/new");
  });
});
