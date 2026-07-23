export const MISSION_CATEGORIES = ["전체", "식비", "교통", "취미", "생활"] as const;

export type MissionCategory = (typeof MISSION_CATEGORIES)[number];

export interface Mission {
  category: Exclude<MissionCategory, "전체">;
  description?: string;
  id: string;
  title: string;
}

export const ACTIVE_MISSIONS: readonly Mission[] = [
  {
    category: "식비",
    description:
      "배달음식 평균 금액은 약 13,000원이에요. 집밥 금액은 약 8,000원 예상되어 약 5,000원 절약 가능해요.",
    id: "active-food-delivery",
    title: "이번 주 배달음식 2회 이하로 주문",
  },
  {
    category: "생활",
    description: "고정비를 점검해 불필요한 구독을 정리해 보세요.",
    id: "active-life-subscription",
    title: "고정비 점검하고 불필요한 구독 1개 해지",
  },
  {
    category: "교통",
    description: "가까운 거리는 걸으면 교통비를 아낄 수 있어요.",
    id: "active-transport-walk",
    title: "가까운 거리 걸어다니기 1회",
  },
];

export const COMPLETED_MISSIONS: readonly Mission[] = [
  { category: "생활", id: "completed-life-subscription", title: "불필요한 구독 해지 1회" },
];
