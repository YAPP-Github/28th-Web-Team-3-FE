import {
  BENEFIT_FILTER_VALUES,
  type Benefit,
  type BenefitFilter,
} from "@/app/(tabs)/benefits/types";

/** URL 쿼리의 category 값을 허용된 값으로 좁힌다. 알 수 없는 값은 전체("all")로 처리한다. */
export function parseBenefitFilter(value: string | string[] | undefined): BenefitFilter {
  if (typeof value !== "string") return "all";
  return BENEFIT_FILTER_VALUES.includes(value as BenefitFilter) ? (value as BenefitFilter) : "all";
}

/**
 * 선택한 칩으로 정책을 필터링한다. "all"이면 전체를 그대로, "saved"면 저장한 것만 돌려준다.
 * 저장 목록에는 사라진 정책의 id가 남아 있을 수 있어 정책 쪽을 기준으로 거른다.
 */
export function filterBenefits(
  benefits: readonly Benefit[],
  category: BenefitFilter,
  savedIds: ReadonlySet<string>,
): readonly Benefit[] {
  if (category === "all") return benefits;
  if (category === "saved") return benefits.filter((benefit) => savedIds.has(benefit.id));
  return benefits.filter((benefit) => benefit.category === category);
}
