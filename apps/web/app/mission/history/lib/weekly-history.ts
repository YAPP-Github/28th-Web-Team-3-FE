import type { MissionWeeklyHistory } from "@repo/schema/mission";

export type MissionWeekDisplay =
  | {
      isCurrentWeek: boolean;
      state: "no-missions";
      week: number;
    }
  | {
      completedCount: number;
      isCurrentWeek: boolean;
      progressPercent: number;
      state: "progress";
      week: number;
    };

/**
 * 백엔드는 미션이 없던 주를 `0/0`으로 보낸다. 이는 0% 달성과 다르므로
 * 화면에서는 별도 빈 상태로 표현한다.
 */
export function toMissionWeekDisplay({
  completedCount,
  isCurrentWeek,
  totalCount,
  weekOfMonth,
}: MissionWeeklyHistory): MissionWeekDisplay {
  if (totalCount === 0) {
    return { isCurrentWeek, state: "no-missions", week: weekOfMonth };
  }

  return {
    completedCount,
    isCurrentWeek,
    progressPercent: Math.round((completedCount * 100) / totalCount),
    state: "progress",
    week: weekOfMonth,
  };
}
