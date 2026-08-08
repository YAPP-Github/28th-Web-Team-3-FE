import { describe, expect, it } from "vitest";
import { formatDday } from "./format";

describe("formatDday", () => {
  it("D-day를 포맷한다", () => {
    expect(formatDday(486)).toBe("D-486");
    expect(formatDday(12)).toBe("D-12");
  });

  it("0 이하는 D-DAY로 clamp한다", () => {
    expect(formatDday(0)).toBe("D-DAY");
    expect(formatDday(-3)).toBe("D-DAY");
  });
});
