import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SavingsComparisonChart } from "./savings-comparison-chart";

describe("SavingsComparisonChart", () => {
  it("금액 차이가 작아도 Figma의 최소 시각 차이를 유지한다", () => {
    render(<SavingsComparisonChart currentEstimate={11_200} improvedEstimate={11_380} />);

    expect(screen.getByTestId("current-savings-bar")).toHaveStyle({ height: "81px" });
    expect(screen.getByTestId("improved-savings-bar")).toHaveStyle({ height: "108px" });
    expect(screen.getByRole("img")).toHaveAccessibleName(
      "예상 자산 비교: 예상 금액 11,200만원, 서비스 이용 시 11,380만원",
    );
  });

  it("두 금액이 같으면 막대 높이도 같게 표시한다", () => {
    render(<SavingsComparisonChart currentEstimate={5_000} improvedEstimate={5_000} />);

    expect(screen.getByTestId("current-savings-bar")).toHaveStyle({ height: "108px" });
    expect(screen.getByTestId("improved-savings-bar")).toHaveStyle({ height: "108px" });
  });
});
