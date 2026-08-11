import type { SavedContent } from "@repo/schema/bookmark";
import type { PolicySummary } from "@repo/schema/policy";
import type { BenefitItem } from "@/app/(tabs)/benefits/types";

/**
 * 혜택 목록 응답 → 카드 항목. 태그는 `category` 그대로 쓴다.
 *
 * `largeCategory`로 떨어뜨리거나 필터 탭 4개(금융·주거·복지·교육)와 맞춰보는 처리를 넣었던
 * 적이 있는데, 실제 응답 값 목록을 모르는 채로 짠 추측이었다. `category`가 원본이므로
 * 그대로 보여준다.
 */
export function toBenefitItem(policy: PolicySummary): BenefitItem {
  return {
    id: policy.id,
    title: policy.title,
    categoryLabel: policy.category ?? null,
    description: policy.description ?? null,
    saved: policy.bookmarked,
  };
}

/** 저장 목록 응답 → 카드 항목. 태그는 정책 상세의 4분류를 사용한다. */
export function toSavedBenefitItem(
  saved: SavedContent,
  policyCategory: string | null | undefined = null,
): BenefitItem {
  return {
    id: saved.id,
    title: saved.title,
    categoryLabel: policyCategory ?? null,
    description: saved.description ?? null,
    saved: true,
  };
}
