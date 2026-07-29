import { describe, expect, it } from "vitest";
import { formatManwon, formatNumber } from "./format";

describe("formatManwon", () => {
  it("천 단위 구분 기호를 붙여 만원으로 포맷한다", () => {
    expect(formatManwon(1950)).toBe("1,950만원");
    expect(formatManwon(5000)).toBe("5,000만원");
  });

  it("0도 포맷한다", () => {
    expect(formatManwon(0)).toBe("0만원");
  });
});

describe("formatNumber", () => {
  it("단위 없이 천 단위만 끊는다", () => {
    expect(formatNumber(1_000_000)).toBe("1,000,000");
    expect(formatNumber(0)).toBe("0");
  });
});
