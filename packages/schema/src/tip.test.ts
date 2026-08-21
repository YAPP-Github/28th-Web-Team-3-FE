import { describe, expect, it } from "vitest";
import { savingTipListSchema } from "./tip";

describe("saving tip API schema", () => {
  it("목록 응답의 팁·원문 링크·저장 상태를 파싱한다", () => {
    expect(
      savingTipListSchema.parse([
        {
          bookmarked: true,
          category: "식비",
          description: "배달 메뉴 대신 집밥 레시피를 활용하기",
          id: 1,
          sourceUrl: "https://example.com/tip",
          subcategory: "배달음식",
          title: "집밥 레시피 활용팁",
        },
      ]),
    ).toHaveLength(1);
  });

  it("미션 분류 밖의 카테고리는 거부한다", () => {
    expect(() =>
      savingTipListSchema.parse([
        {
          bookmarked: false,
          category: "교통",
          description: null,
          id: 1,
          sourceUrl: null,
          subcategory: null,
          title: "팁",
        },
      ]),
    ).toThrow();
  });
});
