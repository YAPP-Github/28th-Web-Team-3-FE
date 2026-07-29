import { describe, expect, it } from "vitest";
import { clampDigits, onlyDigits } from "./number";

describe("onlyDigits", () => {
  it("숫자가 아닌 문자를 지운다", () => {
    expect(onlyDigits("1,234만원")).toBe("1234");
    expect(onlyDigits("1998.03.01")).toBe("19980301");
    expect(onlyDigits("abc")).toBe("");
  });
});

describe("clampDigits", () => {
  it("상한을 넘으면 상한으로 자른다", () => {
    expect(clampDigits("100", 36)).toBe("36");
    expect(clampDigits("12", 36)).toBe("12");
  });

  it("빈 입력은 그대로 둔다 — 지우는 도중 0으로 튀지 않게 한다", () => {
    expect(clampDigits("", 36)).toBe("");
    expect(clampDigits("만원", 36)).toBe("");
  });

  it("하한은 막지 않는다 — 타이핑 도중 값이 튀면 안 된다", () => {
    expect(clampDigits("1", 36)).toBe("1");
  });
});
