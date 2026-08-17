import type { PolicySummary } from "@repo/schema/policy";
import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { homePoliciesOptions, POLICIES_QUERY_KEY } from "@/lib/queries/policy";

/**
 * 이미 받아 둔 정책 목록에서 분류를 꺼낸다(id → category).
 *
 * 저장 목록 응답의 `category`는 혜택 목록이 쓰는 분류와 값이 달라서, 카드 태그를 맞추려면
 * 정책 쪽 분류가 필요하다(`toSavedBenefitItem`). 그렇다고 항목마다 상세를 부르면 저장 30개에
 * 요청이 30번 나간다 — 혜택 목록이나 홈 캐러셀을 이미 봤다면 그 캐시에 같은 값이 있으므로
 * 거기서 먼저 찾고, 없는 것만 상세를 조회한다.
 *
 * 캐시에 없는 항목이 여전히 남는다(앱을 껐다 켜고 저장 화면으로 바로 들어온 경우 등).
 * 근본 해결은 저장 목록 응답이 정책과 같은 분류를 주는 것이다 — 백엔드 확인이 필요하다.
 */
export function readCachedPolicyCategories(queryClient: QueryClient): Map<number, string | null> {
  const categories = new Map<number, string | null>();

  function collect(policies: readonly PolicySummary[] | undefined) {
    for (const policy of policies ?? []) {
      if (!categories.has(policy.id)) categories.set(policy.id, policy.category ?? null);
    }
  }

  // 무한 목록은 카테고리 칩마다 캐시가 따로 있어 접두사로 한꺼번에 훑는다. 모양이 다른
  // 캐시가 섞여 들어와도 터지지 않게 페이지 배열인지 확인하고 지나간다.
  const listCaches = queryClient.getQueriesData<InfiniteData<PolicySummary[]>>({
    queryKey: POLICIES_QUERY_KEY,
  });
  for (const [, data] of listCaches) {
    if (!Array.isArray(data?.pages)) continue;
    for (const page of data.pages) collect(page);
  }

  collect(queryClient.getQueryData<PolicySummary[]>(homePoliciesOptions().queryKey));

  return categories;
}
