import type { SavedContent } from "@repo/schema/bookmark";
import type { PolicySummary } from "@repo/schema/policy";
import { POLICY_CATEGORIES } from "@repo/schema/policy";
import type { BenefitItem } from "@/app/(tabs)/benefits/types";

/**
 * 카드 태그에 쓸 분류. 필터 탭에 있는 4개(금융·주거·복지·교육) 중 하나만 돌려준다.
 *
 * 서버 category/largeCategory는 자유 문자열이다. "일자리"처럼 4개 밖의 값이 오기도 하고,
 * "금융복지문화세트"처럼 여러 분류가 구분자 없이 이어 붙어 오기도 한다(저장 목록은 쉼표로
 * 잇지만 그마저 없는 값도 있다). 원문을 그대로 보여주면 필터 탭에 없는 이름이 카드에
 * 뜬다 — 탭에 있는 이름만 내보낸다. 매칭되는 게 없으면 태그를 아예 안 보여준다. 여러
 * 분류가 섞여 있으면 필터 탭 순서(금융·주거·복지·교육)상 앞선 것 하나만 남긴다.
 */
export function toKnownCategory(raw: string | null | undefined): string | null {
  if (!raw) return null;
  return POLICY_CATEGORIES.find((category) => raw.includes(category)) ?? null;
}

/**
 * 혜택 목록 응답 → 카드 항목. 태그는 소분류(`category`)를 먼저 쓰고, 비어 있으면 대분류로
 * 떨어뜨린다 — 공공 데이터라 둘 중 하나만 채워진 항목이 있다.
 */
export function toBenefitItem(policy: PolicySummary): BenefitItem {
  return {
    id: policy.id,
    title: policy.title,
    categoryLabel: toKnownCategory(policy.category) ?? toKnownCategory(policy.largeCategory),
    description: policy.description ?? null,
    saved: policy.bookmarked,
  };
}

/** 저장 목록 응답 → 카드 항목. 저장 목록에 있다는 것 자체가 저장됨이다. */
export function toSavedBenefitItem(saved: SavedContent): BenefitItem {
  return {
    id: saved.id,
    title: saved.title,
    categoryLabel: toKnownCategory(saved.category),
    description: saved.description ?? null,
    saved: true,
  };
}
