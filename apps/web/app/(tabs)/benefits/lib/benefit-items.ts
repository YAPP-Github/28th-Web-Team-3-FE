import type { SavedContent } from "@repo/schema/bookmark";
import type { PolicySummary } from "@repo/schema/policy";
import type { BenefitItem } from "@/app/(tabs)/benefits/types";

/**
 * 혜택 목록 응답 → 카드 항목. 태그는 소분류(`category`)를 먼저 쓰고, 비어 있으면 대분류로
 * 떨어뜨린다 — 공공 데이터라 둘 중 하나만 채워진 항목이 있다.
 */
export function toBenefitItem(policy: PolicySummary): BenefitItem {
  return {
    id: policy.id,
    title: policy.title,
    categoryLabel: policy.category ?? policy.largeCategory ?? null,
    description: policy.description ?? null,
    saved: policy.bookmarked,
  };
}

/** 저장 목록 응답 → 카드 항목. 저장 목록에 있다는 것 자체가 저장됨이다. */
export function toSavedBenefitItem(saved: SavedContent): BenefitItem {
  return {
    id: saved.id,
    title: saved.title,
    categoryLabel: saved.category ?? null,
    description: saved.description ?? null,
    saved: true,
  };
}
