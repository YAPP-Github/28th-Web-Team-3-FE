export interface YearMonth {
  month: number;
  year: number;
}

const SEOUL_TIME_ZONE = "Asia/Seoul";

export function getCurrentYearMonth(now = new Date()): YearMonth {
  const parts = new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    timeZone: SEOUL_TIME_ZONE,
    year: "numeric",
  }).formatToParts(now);

  return {
    month: Number(parts.find(({ type }) => type === "month")?.value),
    year: Number(parts.find(({ type }) => type === "year")?.value),
  };
}

export function shiftYearMonth({ year, month }: YearMonth, amount: number): YearMonth {
  const shifted = new Date(Date.UTC(year, month - 1 + amount, 1));
  return { month: shifted.getUTCMonth() + 1, year: shifted.getUTCFullYear() };
}

export function formatYearMonth({ year, month }: YearMonth): string {
  return `${year}년 ${month}월`;
}

/** 선택한 달이 있으면 현재 주를 그 달에 귀속하고, 없으면 주의 마지막 날이 속한 달로 센다. */
export function getMissionWeek(
  weekStartDate: string,
  selectedMonth?: YearMonth,
): YearMonth & { week: number } {
  const [year, month, day] = weekStartDate.split("-").map(Number);
  const weekStart = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1));
  const weekEnd = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, (day ?? 1) + 6));
  const targetMonth =
    selectedMonth ??
    ({ month: weekEnd.getUTCMonth() + 1, year: weekEnd.getUTCFullYear() } as const);
  const startsInTargetMonth =
    weekStart.getUTCFullYear() === targetMonth.year &&
    weekStart.getUTCMonth() + 1 === targetMonth.month;
  const lastDayInTargetMonth = startsInTargetMonth
    ? weekStart.getUTCDate() + 6
    : weekEnd.getUTCDate();

  return {
    ...targetMonth,
    week: Math.ceil(lastDayInTargetMonth / 7),
  };
}

export function isSameYearMonth(left: YearMonth, right: YearMonth): boolean {
  return left.year === right.year && left.month === right.month;
}
