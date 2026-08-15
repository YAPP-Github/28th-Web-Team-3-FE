import { describe, expect, it } from "vitest";
import { formatBirthDate, formatGoalPeriod } from "./format";

describe("onboarding format", () => {
  it("생년월일을 점 구분 표기로 바꾼다", () => {
    expect(formatBirthDate("2002-10-24")).toBe("2002.10.24");
  });

  it("목표 기간을 연·개월 단위로 표시한다", () => {
    expect(formatGoalPeriod(6)).toBe("6개월");
    expect(formatGoalPeriod(18)).toBe("1년 6개월");
    expect(formatGoalPeriod(36)).toBe("3년");
  });
});
