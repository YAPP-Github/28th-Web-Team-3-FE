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

export function getCurrentSeoulDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: SEOUL_TIME_ZONE,
    year: "numeric",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;

  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function getYearMonthFromDate(date: string): YearMonth | null {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(date);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return { month, year };
}

export function shiftYearMonth({ year, month }: YearMonth, amount: number): YearMonth {
  const shifted = new Date(Date.UTC(year, month - 1 + amount, 1));
  return { month: shifted.getUTCMonth() + 1, year: shifted.getUTCFullYear() };
}

export function formatYearMonth({ year, month }: YearMonth): string {
  return `${year}년 ${month}월`;
}

export function isSameYearMonth(left: YearMonth, right: YearMonth): boolean {
  return left.year === right.year && left.month === right.month;
}
