import { describe, expect, it } from "vitest";
import { toMissionWeekDisplay } from "./weekly-history";

describe("toMissionWeekDisplay", () => {
  it("미션이 없던 주의 0/0 응답을 별도 빈 상태로 바꾼다", () => {
    expect(
      toMissionWeekDisplay({
        completedCount: 0,
        isCurrentWeek: false,
        totalCount: 0,
        weekEndDate: "2026-08-16",
        weekOfMonth: 2,
        weekStartDate: "2026-08-10",
      }),
    ).toEqual({ isCurrentWeek: false, state: "no-missions", week: 2 });
  });

  it("미션이 있으면 완료 수로 정수 완료율을 계산한다", () => {
    expect(
      toMissionWeekDisplay({
        completedCount: 1,
        isCurrentWeek: true,
        totalCount: 4,
        weekEndDate: "2026-08-23",
        weekOfMonth: 3,
        weekStartDate: "2026-08-17",
      }),
    ).toEqual({
      completedCount: 1,
      isCurrentWeek: true,
      progressPercent: 25,
      state: "progress",
      week: 3,
    });
  });
});
