import type { PolicyCategory } from "@repo/schema/policy";
import { BENEFIT_FILTERS } from "@/app/(tabs)/benefits/constants";
import { BENEFIT_FILTER_VALUES, type BenefitFilter } from "@/app/(tabs)/benefits/types";

/** URL 쿼리의 category 값을 허용된 값으로 좁힌다. 알 수 없는 값은 전체("all")로 처리한다. */
export function parseBenefitFilter(value: string | string[] | undefined): BenefitFilter {
  if (typeof value !== "string") return "all";
  return BENEFIT_FILTER_VALUES.includes(value as BenefitFilter) ? (value as BenefitFilter) : "all";
}

/**
 * 필터에 대응하는 서버 카테고리. "전체"와 "저장"은 카테고리가 아니라 null이다 —
 * 목록 필터링은 서버가 하므로 화면에서 다시 거르지 않는다.
 */
export function getBenefitFilterCategory(filter: BenefitFilter): PolicyCategory | null {
  return BENEFIT_FILTERS.find((item) => item.value === filter)?.category ?? null;
}
