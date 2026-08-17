import type { PolicySummary } from "@repo/schema/policy";
import { describe, expect, it } from "vitest";
import { homePoliciesOptions, policiesOptions } from "@/lib/queries/policy";
import { createTestQueryClient } from "@/lib/test/react";
import { readCachedPolicyCategories } from "./policy-category-cache";

/** 테스트 클라이언트는 gcTime이 0이라 관찰자 없는 캐시가 즉시 사라진다. */
function seedableQueryClient() {
  const queryClient = createTestQueryClient();
  queryClient.setQueryDefaults([], { gcTime: Number.POSITIVE_INFINITY });
  return queryClient;
}

function policy(id: number, category: string | null): PolicySummary {
  return {
    id,
    title: `혜택 ${id}`,
    category,
    largeCategory: "금융",
    description: "설명",
    bookmarked: false,
  };
}

describe("readCachedPolicyCategories", () => {
  it("카테고리별 무한 목록 캐시를 모두 훑는다", () => {
    const queryClient = seedableQueryClient();
    queryClient.setQueryData(policiesOptions(null).queryKey, {
      pages: [[policy(1, "금융")], [policy(2, "주거")]],
      pageParams: [0, 1],
    });
    queryClient.setQueryData(policiesOptions("교육").queryKey, {
      pages: [[policy(3, "교육")]],
      pageParams: [0],
    });

    const categories = readCachedPolicyCategories(queryClient);

    expect(categories.get(1)).toBe("금융");
    expect(categories.get(2)).toBe("주거");
    expect(categories.get(3)).toBe("교육");
  });

  it("홈 캐러셀 캐시에서도 읽는다", () => {
    const queryClient = seedableQueryClient();
    queryClient.setQueryData(homePoliciesOptions().queryKey, [policy(9, "복지")]);

    expect(readCachedPolicyCategories(queryClient).get(9)).toBe("복지");
  });

  // 분류가 빈 정책도 "캐시에 있다"로 세야 상세를 다시 부르지 않는다.
  it("분류가 없는 정책은 null로 담는다", () => {
    const queryClient = seedableQueryClient();
    queryClient.setQueryData(policiesOptions(null).queryKey, {
      pages: [[policy(4, null)]],
      pageParams: [0],
    });

    const categories = readCachedPolicyCategories(queryClient);

    expect(categories.has(4)).toBe(true);
    expect(categories.get(4)).toBeNull();
  });

  it("캐시가 비어 있으면 빈 맵이다", () => {
    expect(readCachedPolicyCategories(seedableQueryClient()).size).toBe(0);
  });
});
