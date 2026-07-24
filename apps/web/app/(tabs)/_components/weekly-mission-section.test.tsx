import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HOME_MISSIONS } from "@/app/(tabs)/constants/home";
import { WeeklyMissionSection } from "./weekly-mission-section";

describe("WeeklyMissionSection", () => {
  it("정적 미션을 그리고 카테고리로 필터링한다", () => {
    render(<WeeklyMissionSection missions={HOME_MISSIONS} />);

    expect(screen.getByText("10% 달성")).toBeInTheDocument();
    expect(screen.getByText("이번 주 배달음식 2회 이하로 주문")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "교통" }));
    expect(screen.getByText("가까운 거리 걸어다니기 1회")).toBeInTheDocument();
    expect(screen.queryByText("이번 주 배달음식 2회 이하로 주문")).not.toBeInTheDocument();
  });

  it("미션이 없으면 추가 CTA를 표시한다", () => {
    render(<WeeklyMissionSection missions={[]} />);

    expect(screen.getByText("0% 달성")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "5,000만원 달성을 위한 미션 추가" })).toHaveAttribute(
      "href",
      "/mission/new",
    );
  });
});
