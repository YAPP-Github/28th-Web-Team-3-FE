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

  it("미션이 있으면 홈·상세와 같은 반올림 기준으로 완료율을 계산한다", () => {
    expect(
      toMissionWeekDisplay({
        completedCount: 4,
        isCurrentWeek: true,
        totalCount: 6,
        weekEndDate: "2026-08-23",
        weekOfMonth: 3,
        weekStartDate: "2026-08-17",
      }),
    ).toEqual({
      completedCount: 4,
      isCurrentWeek: true,
      progressPercent: 67,
      state: "progress",
      week: 3,
    });
  });
});
