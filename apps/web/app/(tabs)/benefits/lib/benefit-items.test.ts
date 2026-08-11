import { describe, expect, it } from "vitest";
import { normalizeCategoryLabel, toBenefitItem, toSavedBenefitItem } from "./benefit-items";

describe("normalizeCategoryLabel", () => {
  // 저장 목록이 대분류·소분류를 쉼표로 이어 붙여 보내는데, 둘이 같은 항목이 흔하다.
  it("같은 값이 반복되면 하나로 줄인다", () => {
    expect(normalizeCategoryLabel("일자리,일자리")).toBe("일자리");
  });

  it("공백이 섞여 있어도 같은 값으로 본다", () => {
    expect(normalizeCategoryLabel("일자리, 일자리 ")).toBe("일자리");
  });

  // 서로 다른 분류까지 하나로 줄이면 원본에 없던 정보가 된다.
  it("서로 다른 분류는 순서대로 남긴다", () => {
    expect(normalizeCategoryLabel("복지,청년")).toBe("복지, 청년");
  });

  it.each([null, undefined, "", " ", ","])("분류가 없으면 null이다(%j)", (raw) => {
    expect(normalizeCategoryLabel(raw)).toBeNull();
  });
});

describe("toSavedBenefitItem", () => {
  it("저장 목록의 겹친 분류를 정리해서 넘긴다", () => {
    const item = toSavedBenefitItem({
      contentType: "POLICY",
      id: 1,
      title: "혜택",
      category: "일자리,일자리",
    });

    expect(item.categoryLabel).toBe("일자리");
  });
});

describe("toBenefitItem", () => {
  it("소분류가 비면 대분류로 떨어뜨린다", () => {
    const item = toBenefitItem({
      id: 1,
      title: "혜택",
      category: null,
      largeCategory: "주거,주거",
      bookmarked: false,
    });

    expect(item.categoryLabel).toBe("주거");
  });
});
