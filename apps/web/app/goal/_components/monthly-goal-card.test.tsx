import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MonthlyGoalCard } from "./monthly-goal-card";

describe("MonthlyGoalCard", () => {
  it("피그마의 12px·12px·16px 세로 간격을 사용한다", () => {
    const { container } = render(
      <MonthlyGoalCard currentLabel="67만원" ddayLabel="D-12" percent={82} targetLabel="82만원" />,
    );

    expect(screen.getByText("67만원").parentElement).toHaveClass("mt-3");
    expect(container.querySelector("[data-monthly-progress]")).toHaveClass("mt-3");
    expect(screen.getByRole("button", { name: "현재 저축액 입력" })).toHaveClass("mt-4");
  });
});
