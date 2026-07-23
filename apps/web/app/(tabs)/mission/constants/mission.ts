export const MISSION_CATEGORIES = ["전체", "식비", "교통", "생활"] as const;

export type MissionCategory = (typeof MISSION_CATEGORIES)[number];

export interface Mission {
  category: Exclude<MissionCategory, "전체">;
  description?: string;
  title: string;
}

export const ACTIVE_MISSIONS: readonly Mission[] = [
  {
    category: "식비",
    description:
      "배달음식 평균 금액은 약 13,000원이에요. 집밥 금액은 약 8,000원 예상되어 약 7,000원 절약 가능해요.",
    title: "이번 주 배달음식 2회 이하로 주문",
  },
  { category: "생활", title: "고정비 점검하고 불필요한 구독 1개 해지" },
  { category: "교통", title: "가까운 거리 걸어다니기 1회" },
];
