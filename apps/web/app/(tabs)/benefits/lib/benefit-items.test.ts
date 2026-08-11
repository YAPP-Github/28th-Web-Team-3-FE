import { describe, expect, it } from "vitest";
import { toBenefitItem, toSavedBenefitItem } from "./benefit-items";

describe("toBenefitItem", () => {
  it("category를 그대로 태그로 쓴다", () => {
    const item = toBenefitItem({
      id: 1,
      title: "혜택",
      category: "일자리",
      largeCategory: "금융",
      bookmarked: false,
    });

    expect(item.categoryLabel).toBe("일자리");
  });

  it("category가 없으면 largeCategory로 떨어뜨리지 않는다", () => {
    const item = toBenefitItem({
      id: 1,
      title: "혜택",
      category: null,
      largeCategory: "금융",
      bookmarked: false,
    });

    expect(item.categoryLabel).toBeNull();
  });
});

describe("toSavedBenefitItem", () => {
  it("category를 그대로 태그로 쓴다", () => {
    const item = toSavedBenefitItem({
      contentType: "POLICY",
      id: 1,
      title: "혜택",
      category: "금융복지문화세트",
    });

    expect(item.categoryLabel).toBe("금융복지문화세트");
  });

  it("category가 없으면 태그를 비운다", () => {
    const item = toSavedBenefitItem({ contentType: "POLICY", id: 1, title: "혜택" });

    expect(item.categoryLabel).toBeNull();
  });
});
