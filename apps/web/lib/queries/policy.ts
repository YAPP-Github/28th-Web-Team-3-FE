import type { PolicyCategory } from "@repo/schema/policy";
import { infiniteQueryOptions, mutationOptions, type QueryClient } from "@tanstack/react-query";
import { bookmarkPolicy, fetchPolicies, unbookmarkPolicy } from "@/api/policy";
import { savedPoliciesOptions } from "@/lib/queries/bookmark";

/** 혜택 목록 캐시 키의 뿌리. 카테고리별 캐시가 이 아래에 달린다. */
const POLICIES_QUERY_KEY = ["policies"] as const;

/** 한 번에 받아오는 혜택 수. 서버 기본값과 같게 두고 다음 페이지 판단에도 쓴다. */
export const POLICY_PAGE_SIZE = 20;

/** 혜택 목록(무한 스크롤). category가 null이면 전체다. */
export function policiesOptions(category: PolicyCategory | null) {
  return infiniteQueryOptions({
    queryKey: [...POLICIES_QUERY_KEY, category] as const,
    queryFn: ({ pageParam }) =>
      fetchPolicies({ category, page: pageParam, size: POLICY_PAGE_SIZE }),
    initialPageParam: 0,
    // 응답이 배열뿐이라 전체 개수를 모른다. 요청한 크기보다 적게 왔으면 마지막 페이지다.
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < POLICY_PAGE_SIZE ? undefined : allPages.length,
  });
}

/**
 * 저장 토글. `saved`는 누르기 직전 상태다 — 저장돼 있으면 취소하고, 아니면 저장한다.
 * 목록의 `bookmarked`와 저장 목록이 둘 다 바뀌므로 양쪽을 무효화한다.
 */
export function togglePolicyBookmarkOptions(queryClient: QueryClient) {
  return mutationOptions({
    mutationFn: ({ policyId, saved }: { policyId: number; saved: boolean }) =>
      saved ? unbookmarkPolicy(policyId) : bookmarkPolicy(policyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POLICIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: savedPoliciesOptions().queryKey });
    },
  });
}
