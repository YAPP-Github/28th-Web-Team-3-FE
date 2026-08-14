import type { MonthlySaving } from "@repo/schema/goal";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@/lib/test/react";
import { MonthlySavingsChart } from "./monthly-savings-chart";

const AUGUST_CURRENT: MonthlySaving[] = [
  { yearMonth: "2026-07", savedManwon: 80, current: false },
  { yearMonth: "2026-08", savedManwon: 100, current: true },
];

const SEPTEMBER_CURRENT: MonthlySaving[] = [
  ...AUGUST_CURRENT.map((saving) => ({ ...saving, current: false })),
  { yearMonth: "2026-09", savedManwon: 120, current: true },
];

describe("MonthlySavingsChart", () => {
  const scrollTo = vi.fn();
  const originalScrollTo = HTMLElement.prototype.scrollTo;

  beforeEach(() => {
    scrollTo.mockClear();
    Object.defineProperty(HTMLElement.prototype, "scrollTo", {
      configurable: true,
      value: scrollTo,
    });
  });

  afterEach(() => {
    if (originalScrollTo) {
      Object.defineProperty(HTMLElement.prototype, "scrollTo", {
        configurable: true,
        value: originalScrollTo,
      });
      return;
    }
    Reflect.deleteProperty(HTMLElement.prototype, "scrollTo");
  });

  it("키보드로 접근할 수 있는 이름 있는 스크롤 영역을 제공한다", () => {
    render(<MonthlySavingsChart monthlySavings={AUGUST_CURRENT} targetManwon={190} />);

    expect(screen.getByRole("region", { name: "월별 저축 현황" })).toHaveAttribute("tabindex", "0");
  });

  it("이번 달이 바뀌면 새 막대로 다시 스크롤한다", () => {
    const { rerender } = render(
      <MonthlySavingsChart monthlySavings={AUGUST_CURRENT} targetManwon={190} />,
    );

    rerender(<MonthlySavingsChart monthlySavings={SEPTEMBER_CURRENT} targetManwon={190} />);

    expect(scrollTo).toHaveBeenCalledTimes(2);
  });
});
