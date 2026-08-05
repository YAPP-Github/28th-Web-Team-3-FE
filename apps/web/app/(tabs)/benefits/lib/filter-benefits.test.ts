import { describe, expect, it } from "vitest";
import type { Benefit } from "@/app/(tabs)/benefits/types";
import { filterBenefits, parseBenefitFilter } from "./filter-benefits";

function benefit(id: string, category: Benefit["category"]): Benefit {
  return {
    id,
    category,
    title: `${id} 제목`,
    summary: "요약",
    condition: "조건",
    officialUrl: "https://example.com",
  };
}

const BENEFITS = [
  benefit("a", "savings"),
  benefit("b", "housing"),
  benefit("c", "savings"),
] as const;

describe("parseBenefitFilter", () => {
  it("허용된 값만 통과시킨다", () => {
    expect(parseBenefitFilter("saved")).toBe("saved");
    expect(parseBenefitFilter("housing")).toBe("housing");
  });

  it("알 수 없는 값과 배열은 전체로 처리한다", () => {
    expect(parseBenefitFilter("nope")).toBe("all");
    expect(parseBenefitFilter(undefined)).toBe("all");
    expect(parseBenefitFilter(["saved"])).toBe("all");
  });
});

describe("filterBenefits", () => {
  it("전체는 그대로 돌려준다", () => {
    expect(filterBenefits(BENEFITS, "all", new Set())).toEqual(BENEFITS);
  });

  it("카테고리로 거른다", () => {
    expect(filterBenefits(BENEFITS, "savings", new Set()).map((b) => b.id)).toEqual(["a", "c"]);
  });

  // 저장은 카테고리가 아니라 별개 축이다 — 저장 목록에 든 것만 남긴다.
  it("저장은 저장한 것만 남긴다", () => {
    expect(filterBenefits(BENEFITS, "saved", new Set(["b", "c"])).map((b) => b.id)).toEqual([
      "b",
      "c",
    ]);
  });

  it("저장한 게 없으면 빈 목록이다", () => {
    expect(filterBenefits(BENEFITS, "saved", new Set())).toEqual([]);
  });

  // 저장 목록에 남은 옛 id는 화면에 나올 정책이 없다 — 그냥 빠져야 한다.
  it("정책에 없는 저장 id는 무시한다", () => {
    expect(filterBenefits(BENEFITS, "saved", new Set(["사라진-정책"]))).toEqual([]);
  });
});
