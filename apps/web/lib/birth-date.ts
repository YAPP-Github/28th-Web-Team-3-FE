import { onlyDigits } from "./number";

export function formatBirthDateInput(value: string) {
  const digits = onlyDigits(value).slice(0, 8);
  return [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8)].filter(Boolean).join(".");
}

export function toIsoBirthDate(value: string) {
  return /^\d{4}\.\d{2}\.\d{2}$/.test(value) ? value.replaceAll(".", "-") : value;
}

export function isRealBirthDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const parts = value.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

/** 서버는 생년월일을 과거 날짜로만 받는다(오늘도 거부) — 보내기 전에 같은 기준으로 거른다. */
export function isPastBirthDate(value: string) {
  if (!isRealBirthDate(value)) return false;

  const parts = value.split("-");
  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])) < todayUtc;
}
