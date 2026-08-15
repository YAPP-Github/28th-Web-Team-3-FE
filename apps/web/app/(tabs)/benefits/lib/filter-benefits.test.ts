import { describe, expect, it } from "vitest";
import { getBenefitFilterCategory, parseBenefitFilter } from "./filter-benefits";

describe("parseBenefitFilter", () => {
  it("허용된 값만 통과시킨다", () => {
    expect(parseBenefitFilter("finance")).toBe("finance");
    expect(parseBenefitFilter("housing")).toBe("housing");
  });

  it("알 수 없는 값과 배열은 전체로 처리한다", () => {
    expect(parseBenefitFilter("nope")).toBe("all");
    expect(parseBenefitFilter(undefined)).toBe("all");
    expect(parseBenefitFilter(["housing"])).toBe("all");
  });

  // 예전 링크(?category=savings 등)는 더 이상 없는 값이다 — 빈 화면 대신 전체로 떨어뜨린다.
  it("옛 카테고리 슬러그도 전체로 처리한다", () => {
    expect(parseBenefitFilter("savings")).toBe("all");
    expect(parseBenefitFilter("tax")).toBe("all");
  });
});

describe("getBenefitFilterCategory", () => {
  it("카테고리 칩은 서버 4분류로 바뀐다", () => {
    expect(getBenefitFilterCategory("finance")).toBe("금융");
    expect(getBenefitFilterCategory("education")).toBe("교육");
  });

  // 전체는 category 쿼리를 붙이면 안 된다 — 붙이면 그 이름의 분류만 걸러진다.
  it("전체는 카테고리가 없다", () => {
    expect(getBenefitFilterCategory("all")).toBeNull();
  });

  // 저장 목록이 칩에서 별도 화면으로 빠졌다. 옛 링크는 전체로 떨어지고(page.tsx가
  // /benefits/saved로 보낸다), 여기서 저장이라는 분류가 서버로 나가면 안 된다.
  it("사라진 저장 칩 값은 전체로 떨어진다", () => {
    expect(parseBenefitFilter("saved")).toBe("all");
  });
});
