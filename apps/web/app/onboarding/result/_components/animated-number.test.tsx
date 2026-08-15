import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@/lib/test/react";
import { AnimatedNumber } from "./animated-number";

describe("AnimatedNumber", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("현재 숫자에서 변경된 숫자까지 부드럽게 보간한다", async () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: false }));
    const { rerender } = render(<AnimatedNumber format={(value) => `${value}만원`} value={115} />);

    expect(screen.getByLabelText("115만원")).toHaveClass("tabular-nums");

    rerender(<AnimatedNumber format={(value) => `${value}만원`} value={120} />);

    expect(screen.getByLabelText("120만원")).toHaveTextContent("115만원");
    await waitFor(() => expect(screen.getByText("120만원")).toBeInTheDocument());
  });

  it("동작 줄이기 환경에서는 새 숫자를 즉시 표시한다", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    const { rerender } = render(<AnimatedNumber value={115} />);

    rerender(<AnimatedNumber value={120} />);

    expect(screen.getByText("120")).toBeInTheDocument();
  });
});
