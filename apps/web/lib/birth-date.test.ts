import { describe, expect, it, vi } from "vitest";
import {
  formatBirthDateInput,
  isPastBirthDate,
  isRealBirthDate,
  toIsoBirthDate,
} from "./birth-date";

describe("birth date utilities", () => {
  it("부분 입력을 점 구분 표기로 정규화한다", () => {
    expect(formatBirthDateInput("1998")).toBe("1998");
    expect(formatBirthDateInput("199803")).toBe("1998.03");
    expect(formatBirthDateInput("1998.03.01abc")).toBe("1998.03.01");
  });

  it("완성된 점 구분 표기만 ISO 날짜로 바꾼다", () => {
    expect(toIsoBirthDate("2002.10.24")).toBe("2002-10-24");
    expect(toIsoBirthDate("2002.10")).toBe("2002.10");
    expect(toIsoBirthDate("2002-10-24")).toBe("2002-10-24");
  });

  it("실제로 존재하는 날짜인지 검증한다", () => {
    expect(isRealBirthDate("2000-02-29")).toBe(true);
    expect(isRealBirthDate("1900-02-29")).toBe(false);
    expect(isRealBirthDate("2002-10")).toBe(false);
  });

  it("오늘 이전의 실재하는 날짜만 과거 날짜로 인정한다", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 11, 12));

    try {
      expect(isPastBirthDate("2026-09-10")).toBe(true);
      expect(isPastBirthDate("2026-09-11")).toBe(false);
      expect(isPastBirthDate("2026-09-12")).toBe(false);
      expect(isPastBirthDate("1900-02-29")).toBe(false);
      expect(isPastBirthDate("2002-10")).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});
