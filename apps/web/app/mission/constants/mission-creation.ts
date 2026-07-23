export const MISSION_RECOMMENDATION_CATEGORIES = [
  { description: "일주일에 2번, 집밥으로 점심 해결하기", name: "식비" },
  { description: "가까운 거리 1회 걸어가기", name: "교통" },
  { description: "이번 달 구독료 1개 해지", name: "취미" },
  { description: "무지출 데이 1회", name: "생활" },
] as const;

export type MissionCreationCategory = (typeof MISSION_RECOMMENDATION_CATEGORIES)[number]["name"];

export interface MissionSuggestion {
  description: string;
  title: string;
}

export const MISSION_SUGGESTIONS: Record<MissionCreationCategory, readonly MissionSuggestion[]> = {
  식비: [
    {
      description:
        "배달음식 평균 금액은 약 13,000원이에요. 집밥 금액은 약 8,000원 예상되어 약 5,000원 절약 가능해요.",
      title: "이번 주 배달음식 2회 이하로 주문",
    },
    {
      description: "커피 평균 금액은 약 4,000원이에요. 3번으로 줄이면 약 8,000원 절약 가능해요.",
      title: "커피 5번에서 3번으로 줄이기",
    },
  ],
  교통: [
    {
      description: "가까운 거리는 걸으면 교통비를 아낄 수 있어요.",
      title: "가까운 거리 걸어다니기 1회",
    },
    {
      description: "대중교통 이용 전 이동 경로를 한 번 더 확인해 보세요.",
      title: "교통비 절약 경로로 이동하기",
    },
  ],
  취미: [
    {
      description: "구독 1개 해지 시 약 월 1만~2만 원, 연간으로는 약 12만~24만 원 절약 가능해요.",
      title: "이번 달 구독료 1개 해지하기",
    },
    {
      description: "커피 평균 금액은 약 4,000원이에요. 3번으로 줄이면 약 8,000원 절약 가능해요.",
      title: "커피 5번에서 3번으로 줄이기",
    },
    {
      description:
        "배달음식 평균 금액은 약 13,000원이에요. 집밥 금액은 약 8,000원 예상되어 약 7,000원 절약 가능해요.",
      title: "이번 주 배달음식 2회 이하로 주문",
    },
  ],
  생활: [
    {
      description: "하루 한 번 지출을 기록하면 불필요한 소비를 찾기 쉬워요.",
      title: "무지출 데이 1회 만들기",
    },
    {
      description: "고정비를 점검해 불필요한 구독을 정리해 보세요.",
      title: "고정비 점검하고 구독 1개 해지",
    },
  ],
};

export function parseMissionCreationCategories(value: string | undefined) {
  if (!value) return [];

  const categoryNames = new Set(MISSION_RECOMMENDATION_CATEGORIES.map((category) => category.name));
  return [
    ...new Set(
      value
        .split(",")
        .filter((category): category is MissionCreationCategory =>
          categoryNames.has(category as MissionCreationCategory),
        ),
    ),
  ];
}

export function buildMissionCreationFormHref(
  categories: readonly MissionCreationCategory[],
  step: number,
) {
  const searchParams = new URLSearchParams({
    categories: categories.join(","),
    step: String(step),
  });

  return `/mission/new/form?${searchParams}`;
}

export function buildMissionCreationResultHref(categories: readonly MissionCreationCategory[]) {
  const searchParams = new URLSearchParams({ categories: categories.join(",") });
  return `/mission/new/result?${searchParams}`;
}
