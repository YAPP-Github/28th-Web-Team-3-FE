import { describe, expect, it } from "vitest";
import { toBenefitItem, toKnownCategory, toSavedBenefitItem } from "./benefit-items";

describe("toKnownCategory", () => {
  // 필터 탭에 있는 이름만 카드에 뜨게 한다 — 그 밖의 값은 태그 없이 둔다.
  it("필터 탭에 없는 분류는 보여주지 않는다", () => {
    expect(toKnownCategory("일자리")).toBeNull();
  });

  // 저장 목록은 여러 분류를 구분자 없이 이어 붙여 보낸다. 하나만 골라낸다.
  it("여러 분류가 붙어 오면 필터 탭 순서상 앞선 것 하나만 남긴다", () => {
    expect(toKnownCategory("금융복지문화세트")).toBe("금융");
  });

  it("쉼표로 이어져도 하나만 남긴다", () => {
    expect(toKnownCategory("복지,금융")).toBe("금융");
  });

  it("정확히 하나면 그대로 쓴다", () => {
    expect(toKnownCategory("교육")).toBe("교육");
  });

  it.each([null, undefined, "", "일자리,문화"])("매칭이 없으면 null이다(%j)", (raw) => {
    expect(toKnownCategory(raw)).toBeNull();
  });
});

describe("toSavedBenefitItem", () => {
  it("필터 탭에 없는 분류는 태그를 비운다", () => {
    const item = toSavedBenefitItem({
      contentType: "POLICY",
      id: 1,
      title: "혜택",
      category: "일자리",
    });

    expect(item.categoryLabel).toBeNull();
  });

  it("여러 분류가 섞여 오면 하나만 남긴다", () => {
    const item = toSavedBenefitItem({
      contentType: "POLICY",
      id: 1,
      title: "혜택",
      category: "금융복지문화세트",
    });

    expect(item.categoryLabel).toBe("금융");
  });
});

describe("toBenefitItem", () => {
  it("소분류가 필터 탭 밖이면 대분류로 떨어뜨린다", () => {
    const item = toBenefitItem({
      id: 1,
      title: "혜택",
      category: "일자리",
      largeCategory: "주거",
      bookmarked: false,
    });

    expect(item.categoryLabel).toBe("주거");
  });

  it("둘 다 필터 탭 밖이면 태그를 비운다", () => {
    const item = toBenefitItem({
      id: 1,
      title: "혜택",
      category: "일자리",
      largeCategory: "문화",
      bookmarked: false,
    });

    expect(item.categoryLabel).toBeNull();
  });
});
