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
 * 절약 팁은 편집된 정적 콘텐츠다. 정책 API와 달리 사용자의 게스트 토큰이나 서버 페이지네이션이
 * 필요하지 않다.
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

/**
 * 홈 화면 팁 카드가 참조하는 정적 정책 데이터. 혜택 목록은 API로 옮겼지만
 * 팁(`/api/tips`)은 아직이라 이 데이터가 남아 있다.
 */
export interface Benefit {
  id: string;
  category: "savings" | "housing" | "living" | "tax";
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

/** 편집된 절약 팁 한 건. 원문을 열기 전 카드에는 제목과 RAG 요약만 보여 준다. */
export interface SavingTip {
  id: string;
  category: "식비" | "생활" | "취미";
  selection: string;
  ragText: string;
  title: string;
  url: string;
}
