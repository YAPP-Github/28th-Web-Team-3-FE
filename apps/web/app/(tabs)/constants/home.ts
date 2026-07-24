export const HOME_MISSION_CATEGORIES = ["전체", "식비", "교통", "생활"] as const;

export type HomeMissionCategory = (typeof HOME_MISSION_CATEGORIES)[number];

export interface HomeMission {
  category: Exclude<HomeMissionCategory, "전체">;
  id: string;
  title: string;
}

export const HOME_MISSIONS: readonly HomeMission[] = [
  { id: "home-food-delivery", category: "식비", title: "이번 주 배달음식 2회 이하로 주문" },
  {
    id: "home-living-subscription",
    category: "생활",
    title: "고정비 점검하고 불필요한 구독 1개 해지",
  },
  { id: "home-transport-walk", category: "교통", title: "가까운 거리 걸어다니기 1회" },
];

export interface FinancialTip {
  id: string;
  category: string;
  summary: string;
  title: string;
}

export const FINANCIAL_TIPS: readonly FinancialTip[] = [
  {
    id: "youth-future-savings",
    category: "정부 정책",
    title: "20대 필수, 청년 미래적금 가입조건 정리",
    summary: "최대 2,255만원 수령 가능",
  },
  {
    id: "delivery-saving",
    category: "절약 꿀팁",
    title: "배달비만 줄여도 쏠쏠해요",
    summary: "1인 가구 식비 절약법",
  },
  {
    id: "subscription-saving",
    category: "고정비 관리",
    title: "안 쓰는 구독은 이번 달에 정리해요",
    summary: "월 1만원부터 모아보기",
  },
];
