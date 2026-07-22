import type { BenefitCategory } from "../types";

/**
 * 카테고리별 혜택 목록 URL. 필터 링크(`href`)와 선택 후 히스토리 동기화가 같은 규칙을
 * 써야 하므로 여기 한 곳에서만 만든다. 전체("all")는 쿼리 없이 기본 경로로 둔다.
 */
export function getBenefitCategoryHref(category: BenefitCategory): string {
  return category === "all" ? "/benefits" : `/benefits?category=${category}`;
}
