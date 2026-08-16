import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { homePoliciesOptions, POLICIES_QUERY_KEY, policiesOptions } from "./policy";

describe("정책 캐시 키", () => {
  /**
   * 저장 토글은 `["policies"]` 접두사로 무한 목록 캐시를 한꺼번에 갱신한다
   * (`use-saved-toggle-queue.ts`). 홈 캐러셀 응답은 배열이라 모양이 다른데, 같은 뿌리에
   * 있으면 그 갱신에 걸려 터지고 별이 통째로 먹통이 된다.
   */
  it("홈 캐러셀은 무한 목록과 다른 뿌리를 쓴다", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(homePoliciesOptions().queryKey, []);
    queryClient.setQueryData(policiesOptions(null).queryKey, { pages: [], pageParams: [] });

    const matched = queryClient.getQueriesData({ queryKey: POLICIES_QUERY_KEY });

    expect(matched).toHaveLength(1);
    expect(matched[0]?.[0]).toEqual(policiesOptions(null).queryKey);
  });

  it("카테고리별 목록은 같은 뿌리 아래에 있다", () => {
    expect(policiesOptions("금융").queryKey.slice(0, 1)).toEqual([...POLICIES_QUERY_KEY]);
  });
});
