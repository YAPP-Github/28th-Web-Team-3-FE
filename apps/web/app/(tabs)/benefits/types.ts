/**
 * 필터 칩 한 줄에 놓이는 값들. "all"과 "saved"는 정책이 갖는 카테고리가 아니라 목록을 좁히는
 * 방식이다 — 칩이 단일 선택이라 카테고리와 같은 줄에서 같은 축으로 다룬다.
 */
export const BENEFIT_FILTER_VALUES = [
  "all",
  "saved",
  "savings",
  "housing",
  "living",
  "tax",
] as const;
export type BenefitFilter = (typeof BENEFIT_FILTER_VALUES)[number];
/** 정책 하나가 실제로 갖는 카테고리. */
export type BenefitItemCategory = Exclude<BenefitFilter, "all" | "saved">;

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

export interface FinancialTip {
  id: string;
  category: string;
  summary: string;
  title: string;
}
