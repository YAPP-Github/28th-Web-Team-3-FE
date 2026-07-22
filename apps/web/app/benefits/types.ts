export const BENEFIT_CATEGORY_VALUES = ["all", "savings", "housing", "living", "tax"] as const;
export type BenefitCategory = (typeof BENEFIT_CATEGORY_VALUES)[number];
export type BenefitItemCategory = Exclude<BenefitCategory, "all">;

export interface Benefit {
  id: string;
  category: BenefitItemCategory;
  title: string;
  summary: string;
  /** 대상·요건 한 줄 요약. */
  condition: string;
  /** 공식 페이지 URL — 카드를 누르면 바로 이동한다. */
  officialUrl: string;
}
