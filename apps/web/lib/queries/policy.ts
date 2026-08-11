import type { PolicyCategory } from "@repo/schema/policy";
import { infiniteQueryOptions, mutationOptions } from "@tanstack/react-query";
import { bookmarkPolicy, fetchPolicies, unbookmarkPolicy } from "@/api/policy";

/** 혜택 목록 캐시 키의 뿌리. 카테고리별 캐시가 이 아래에 달린다. */
export const POLICIES_QUERY_KEY = ["policies"] as const;

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
 *
 * 캐시 갱신은 여기서 하지 않는다. 화면은 누르는 즉시 바뀌어야 하는데 이 mutation은
 * 연타를 모은 뒤에야 시작되므로, 낙관적 반영과 재조회 시점은 `useToggleSavedBenefit`이
 * 누름 단위로 관리한다.
 */
export function togglePolicyBookmarkOptions() {
  return mutationOptions({
    mutationFn: ({ policyId, saved }: { policyId: number; saved: boolean }) =>
      saved ? unbookmarkPolicy(policyId) : bookmarkPolicy(policyId),
  });
}
