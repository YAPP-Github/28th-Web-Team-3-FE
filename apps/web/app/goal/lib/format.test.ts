import { describe, expect, it } from "vitest";
import { formatDday, formatManwon } from "./format";

describe("formatManwon", () => {
  it("천 단위 구분 기호를 붙여 만원으로 포맷한다", () => {
    expect(formatManwon(1950)).toBe("1,950만원");
    expect(formatManwon(5000)).toBe("5,000만원");
  });

  it("0도 포맷한다", () => {
    expect(formatManwon(0)).toBe("0만원");
  });
});

describe("formatDday", () => {
  it("D-day를 포맷한다", () => {
    expect(formatDday(486)).toBe("D-486");
    expect(formatDday(12)).toBe("D-12");
  });
});
