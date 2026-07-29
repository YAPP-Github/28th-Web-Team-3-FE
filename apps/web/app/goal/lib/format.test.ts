import { describe, expect, it } from "vitest";
import { formatDday } from "./format";

describe("formatDday", () => {
  it("D-day를 포맷한다", () => {
    expect(formatDday(486)).toBe("D-486");
    expect(formatDday(12)).toBe("D-12");
  });
});
