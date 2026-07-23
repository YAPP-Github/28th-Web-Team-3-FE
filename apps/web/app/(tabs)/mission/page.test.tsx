import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MissionPage from "./page";

describe("MissionPage", () => {
  it("카테고리를 필터링하고 미션 상세를 펼친다", () => {
    render(<MissionPage />);

    fireEvent.click(screen.getByRole("tab", { name: "식비" }));
    expect(screen.getByText("이번 주 배달음식 2회 이하로 주문")).toBeInTheDocument();
    expect(screen.queryByText("가까운 거리 걸어다니기 1회")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /이번 주 배달음식/ }));
    expect(screen.getByText(/배달음식 평균 금액은 약 13,000원/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "삭제" }));
    expect(screen.queryByText("이번 주 배달음식 2회 이하로 주문")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "교통" }));
    expect(screen.queryByText("불필요한 구독 해지 1회")).not.toBeInTheDocument();
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
