import { describe, expect, it } from "vitest";
import { formatYearMonth, getMissionWeek, shiftYearMonth } from "./month";

describe("mission history month", () => {
  it("연도를 넘겨 이전 달과 다음 달을 계산한다", () => {
    expect(shiftYearMonth({ month: 1, year: 2026 }, -1)).toEqual({ month: 12, year: 2025 });
    expect(shiftYearMonth({ month: 12, year: 2026 }, 1)).toEqual({ month: 1, year: 2027 });
    expect(formatYearMonth({ month: 8, year: 2026 })).toBe("2026년 8월");
  });

  it("월초를 걸친 주는 마지막 날이 속한 달의 1주차로 센다", () => {
    expect(getMissionWeek("2026-07-27")).toEqual({ month: 8, week: 1, year: 2026 });
    expect(getMissionWeek("2026-08-10")).toEqual({ month: 8, week: 3, year: 2026 });
  });

  it("월말의 현재 주는 미래 달로 넘기지 않고 선택한 달의 마지막 주차로 센다", () => {
    expect(getMissionWeek("2026-08-31", { month: 8, year: 2026 })).toEqual({
      month: 8,
      week: 6,
      year: 2026,
    });
  });
});
