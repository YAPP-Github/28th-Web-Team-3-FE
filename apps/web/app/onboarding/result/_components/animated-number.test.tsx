import { describe, expect, it } from "vitest";
import { render, screen } from "@/lib/test/react";
import { AnimatedNumber } from "./animated-number";

describe("AnimatedNumber", () => {
  it("값을 포맷해 표시하고 변경된 숫자로 갱신한다", () => {
    const { rerender } = render(<AnimatedNumber format={(value) => `${value}만원`} value={115} />);

    expect(screen.getByText("115만원")).toHaveClass("tabular-nums");

    rerender(<AnimatedNumber format={(value) => `${value}만원`} value={116} />);

    expect(screen.getByText("116만원")).toBeInTheDocument();
  });
});
