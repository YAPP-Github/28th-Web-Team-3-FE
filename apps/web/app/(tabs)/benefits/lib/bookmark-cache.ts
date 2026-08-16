import type { SavedContent } from "@repo/schema/bookmark";
import type { PolicySummary } from "@repo/schema/policy";
import type { InfiniteData } from "@tanstack/react-query";
import type { BenefitItem } from "@/app/(tabs)/benefits/types";

/**
 * 별을 누른 순간 화면에 반영할 캐시 변환. 서버 응답을 기다렸다 뒤집으면 왕복 동안 별이
 * 눌리지 않은 것처럼 보여 사용자가 한 번 더 누른다.
 *
 * 순수 함수로 빼둔다 — 캐시를 실제로 쓰는 건 훅이고, 어떤 모양으로 바뀌어야 하는지는
 * 여기서 따로 검증한다.
 */

/**
 * 혜택 목록(무한 스크롤)의 해당 항목만 `bookmarked`를 바꾼다.
 *
 * 무한 목록이 아닌 캐시는 그대로 돌려준다. 호출부가 `setQueriesData`로 `["policies"]`
 * 접두사를 한꺼번에 갱신하는데, 타입만으로는 매칭된 캐시가 전부 `InfiniteData`라고 보장할
 * 수 없다. 실제로 같은 뿌리에 배열 모양 캐시(홈 캐러셀)가 하나 들어오자 여기서 터져
 * 저장 버튼이 통째로 먹통이 됐다 — 갱신 하나가 클릭 전체를 죽이지 않게 막는다.
 */
export function applyBookmarkToPolicies(
  data: InfiniteData<PolicySummary[]> | undefined,
  policyId: number,
  saved: boolean,
): InfiniteData<PolicySummary[]> | undefined {
  if (!data || !Array.isArray(data.pages)) return data;
  return {
    ...data,
    pages: data.pages.map((page) =>
      page.map((policy) => (policy.id === policyId ? { ...policy, bookmarked: saved } : policy)),
    ),
  };
}

/**
 * 저장 목록에서 넣거나 뺀다. 저장 칩을 보고 있을 때 취소하면 카드가 바로 사라져야 한다.
 *
 * 팁도 같은 목록에 담기므로 id만으로 찾지 않는다 — 같은 번호의 팁을 지울 수 있다.
 */
export function applyBookmarkToSavedList(
  list: readonly SavedContent[] | undefined,
  benefit: BenefitItem,
  saved: boolean,
): readonly SavedContent[] | undefined {
  if (!list) return list;

  const isSamePolicy = (item: SavedContent) =>
    item.contentType === "POLICY" && item.id === benefit.id;

  if (!saved) return list.filter((item) => !isSamePolicy(item));
  // 이미 들어 있으면 같은 배열을 돌려준다 — 새로 만들면 목록이 통째로 다시 그려진다.
  if (list.some(isSamePolicy)) return list;

  // 방금 저장한 것이라 맨 앞에 둔다. 재조회가 오면 서버 순서로 정리된다.
  return [
    {
      contentType: "POLICY",
      id: benefit.id,
      title: benefit.title,
      category: benefit.categoryLabel,
      description: benefit.description,
    },
    ...list,
  ];
}
