import type { PolicyCategory } from "@repo/schema/policy";
import {
  infiniteQueryOptions,
  mutationOptions,
  type QueryClient,
  queryOptions,
} from "@tanstack/react-query";
import { bookmarkPolicy, fetchPolicies, fetchPolicyDetail, unbookmarkPolicy } from "@/api/policy";

/**
 * 무한 혜택 목록 캐시 키의 뿌리. 카테고리별 캐시가 이 아래에 달린다.
 *
 * **이 아래에는 `InfiniteData` 모양만 둔다.** 저장 토글이 이 뿌리로 접두사 매칭해
 * `setQueriesData`로 한꺼번에 갱신하므로(`use-saved-toggle-queue.ts`), 모양이 다른 캐시가
 * 섞이면 갱신 함수가 그 캐시에서 터지고 별을 눌러도 아무 일도 일어나지 않는다.
 */
export const POLICIES_QUERY_KEY = ["policies"] as const;
const POLICY_DETAIL_QUERY_KEY = ["policy-detail"] as const;

/** 한 번에 받아오는 혜택 수. 서버 기본값과 같게 두고 다음 페이지 판단에도 쓴다. */
export const POLICY_PAGE_SIZE = 20;
export const HOME_POLICY_COUNT = 5;

/**
 * 홈 캐러셀에 노출할 전체 정책 첫 5개.
 *
 * 응답이 배열이라 무한 목록(`InfiniteData`)과 모양이 다르다. 그래서 `POLICIES_QUERY_KEY`
 * 아래가 아니라 별도 뿌리를 쓴다 — 같은 뿌리에 두면 저장 토글의 접두사 매칭에 걸린다.
 * 홈 캐러셀은 저장 여부를 그리지 않으므로 낙관적 갱신 대상도 아니다.
 */
export function homePoliciesOptions() {
  return queryOptions({
    queryKey: ["home-policies", HOME_POLICY_COUNT] as const,
    queryFn: () => fetchPolicies({ category: null, page: 0, size: HOME_POLICY_COUNT }),
  });
}

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

/** 저장 목록 카드의 4분류를 원본 정책과 맞출 때 재사용하는 상세 조회. */
export function policyDetailOptions(policyId: number) {
  return queryOptions({
    queryKey: [...POLICY_DETAIL_QUERY_KEY, policyId] as const,
    queryFn: () => fetchPolicyDetail(policyId),
  });
}

/**
 * 카드를 눌렀을 때만 필요한 상세 조회 — 목록 응답에 신청 링크가 없어 탭 시점에 받아야 한다.
 *
 * 화면이 계속 구독할 값이 아니라 누름에 딸린 한 번의 실행이라 `useQuery`가 아니라 mutation
 * 으로 둔다. 안에서 `fetchQuery`를 타므로 저장 화면이 이미 받아 둔 상세와 캐시를 공유하고,
 * 같은 카드를 다시 눌러도 staleTime 안이면 요청이 나가지 않는다.
 */
export function loadPolicyDetailOptions(queryClient: QueryClient) {
  return mutationOptions({
    mutationFn: (policyId: number) => queryClient.fetchQuery(policyDetailOptions(policyId)),
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
