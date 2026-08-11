import type { SavedContent } from "@repo/schema/bookmark";
import type { PolicySummary } from "@repo/schema/policy";
import type { BenefitItem } from "@/app/(tabs)/benefits/types";

/**
 * 카드 태그에 쓸 분류 문자열 정리.
 *
 * 저장 목록은 분류를 필드로 나눠 주지 않고 쉼표로 이어 붙여 보낸다. 대분류와 소분류가 같은
 * 항목이 흔해서 "일자리,일자리"처럼 같은 값이 두 번 찍힌다.
 *
 * 값과 순서는 원본 그대로 두고 중복만 걷어낸다 — 어느 쪽이 대분류인지 응답만 봐서는 알 수
 * 없어 하나를 골라 버리면 다른 분류를 가진 항목에서 엉뚱한 쪽이 남는다.
 */
export function normalizeCategoryLabel(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const parts = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return null;
  return [...new Set(parts)].join(", ");
}

/**
 * 혜택 목록 응답 → 카드 항목. 태그는 소분류(`category`)를 먼저 쓰고, 비어 있으면 대분류로
 * 떨어뜨린다 — 공공 데이터라 둘 중 하나만 채워진 항목이 있다.
 */
export function toBenefitItem(policy: PolicySummary): BenefitItem {
  return {
    id: policy.id,
    title: policy.title,
    categoryLabel:
      normalizeCategoryLabel(policy.category) ?? normalizeCategoryLabel(policy.largeCategory),
    description: policy.description ?? null,
    saved: policy.bookmarked,
  };
}

/** 저장 목록 응답 → 카드 항목. 저장 목록에 있다는 것 자체가 저장됨이다. */
export function toSavedBenefitItem(saved: SavedContent): BenefitItem {
  return {
    id: saved.id,
    title: saved.title,
    categoryLabel: normalizeCategoryLabel(saved.category),
    description: saved.description ?? null,
    saved: true,
  };
}
