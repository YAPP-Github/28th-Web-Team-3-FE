import type { SavedContent } from "@repo/schema/bookmark";
import type { PolicySummary } from "@repo/schema/policy";
import type { InfiniteData } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { BenefitItem } from "@/app/(tabs)/benefits/types";
import { applyBookmarkToPolicies, applyBookmarkToSavedList } from "./bookmark-cache";

function policy(id: number, bookmarked = false): PolicySummary {
  return { id, title: `혜택 ${id}`, category: "금융", largeCategory: "금융", bookmarked };
}

function pages(...groups: PolicySummary[][]): InfiniteData<PolicySummary[]> {
  return { pages: groups, pageParams: groups.map((_, index) => index) };
}

const BENEFIT: BenefitItem = {
  id: 2,
  title: "혜택 2",
  categoryLabel: "금융",
  description: "설명",
  saved: false,
};

describe("applyBookmarkToPolicies", () => {
  // 무한 스크롤이라 같은 항목이 몇 번째 페이지에 있을지 모른다.
  it("어느 페이지에 있든 그 항목만 바꾼다", () => {
    const next = applyBookmarkToPolicies(pages([policy(1)], [policy(2)]), 2, true);

    expect(next?.pages[0]?.[0]?.bookmarked).toBe(false);
    expect(next?.pages[1]?.[0]?.bookmarked).toBe(true);
  });

  it("캐시가 비어 있으면 그대로 둔다", () => {
    expect(applyBookmarkToPolicies(undefined, 1, true)).toBeUndefined();
  });
});

describe("applyBookmarkToSavedList", () => {
  it("저장하면 맨 앞에 넣는다", () => {
    const next = applyBookmarkToSavedList([], BENEFIT, true);

    expect(next).toEqual([
      { contentType: "POLICY", id: 2, title: "혜택 2", category: "금융", description: "설명" },
    ]);
  });

  it("취소하면 뺀다", () => {
    const list: SavedContent[] = [{ contentType: "POLICY", id: 2, title: "혜택 2" }];

    expect(applyBookmarkToSavedList(list, BENEFIT, false)).toEqual([]);
  });

  // 저장 목록에는 팁도 함께 담긴다. id만 보면 같은 번호의 팁이 지워진다.
  it("같은 번호의 팁은 건드리지 않는다", () => {
    const list: SavedContent[] = [
      { contentType: "TIP", id: 2, title: "팁 2" },
      { contentType: "POLICY", id: 2, title: "혜택 2" },
    ];

    expect(applyBookmarkToSavedList(list, BENEFIT, false)).toEqual([
      { contentType: "TIP", id: 2, title: "팁 2" },
    ]);
  });

  it("이미 저장돼 있으면 중복해서 넣지 않는다", () => {
    const list: SavedContent[] = [{ contentType: "POLICY", id: 2, title: "혜택 2" }];

    expect(applyBookmarkToSavedList(list, BENEFIT, true)).toBe(list);
  });
});
