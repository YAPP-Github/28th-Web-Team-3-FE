import { BENEFIT_CATEGORY_VALUES, type Benefit, type BenefitCategory } from "../types";

/** URL 쿼리의 category 값을 허용된 값으로 좁힌다. 알 수 없는 값은 전체("all")로 처리한다. */
export function parseBenefitCategory(value: string | string[] | undefined): BenefitCategory {
  if (typeof value !== "string") return "all";
  return BENEFIT_CATEGORY_VALUES.includes(value as BenefitCategory)
    ? (value as BenefitCategory)
    : "all";
}

/** 선택 카테고리로 정책을 필터링한다. "all"이면 전체를 그대로 돌려준다. */
export function filterBenefits(
  benefits: readonly Benefit[],
  category: BenefitCategory,
): readonly Benefit[] {
  if (category === "all") return benefits;
  return benefits.filter((benefit) => benefit.category === category);
}
