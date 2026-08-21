/**
 * 필터 칩 한 줄에 놓이는 값들. "all"은 정책이 갖는 카테고리가 아니라 목록을 좁히지 않는다는
 * 뜻이라, 칩이 단일 선택이므로 카테고리와 같은 줄에서 같은 축으로 다룬다.
 *
 * 카테고리 값은 서버 4분류(금융·주거·복지·교육)와 1:1이다. URL에는 영문 슬러그를 쓰고
 * 서버 쿼리로 나갈 때만 한글 분류로 바꾼다(`constants.ts`의 `BENEFIT_FILTERS`).
 *
 * "저장"은 여기 없다 — 저장 목록은 칩이 아니라 별도 화면(`/benefits/saved`)이다.
 */
export const BENEFIT_FILTER_VALUES = ["all", "finance", "housing", "welfare", "education"] as const;
export type BenefitFilter = (typeof BENEFIT_FILTER_VALUES)[number];

/**
 * 상단 탭이 고르는 콘텐츠 종류.
 *
 * 절약 팁은 게스트별 북마크 상태를 포함한 서버 API로 조회한다.
 */
export const BENEFIT_CONTENT_TYPES = [
  { value: "policy", label: "정책 혜택" },
  { value: "tip", label: "절약 팁" },
] as const;
export type BenefitContentType = (typeof BENEFIT_CONTENT_TYPES)[number]["value"];

/**
 * 카드가 쓰는 목록 항목. 혜택 목록(`PolicySummary`)과 저장 목록(`SavedContent`)의 응답 모양이
 * 달라 화면이 쓰는 값만 여기로 모은다.
 */
export interface BenefitItem {
  id: number;
  title: string;
  /** 카드 태그에 쓰는 분류. 원본 공공 데이터에 분류가 없는 항목이 있다. */
  categoryLabel: string | null;
  description: string | null;
  saved: boolean;
}
