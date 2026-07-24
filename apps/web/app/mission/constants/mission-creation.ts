import type { MissionCategory as ApiMissionCategory } from "@repo/schema/mission";

export const MISSION_RECOMMENDATION_CATEGORIES = [
  { description: "일주일에 2번, 집밥으로 점심 해결하기", name: "식비" },
  { description: "가까운 거리 1회 걸어가기", name: "교통" },
  { description: "이번 달 구독료 1개 해지", name: "취미" },
  { description: "무지출 데이 1회", name: "생활" },
] as const;

export type MissionCreationCategory = (typeof MISSION_RECOMMENDATION_CATEGORIES)[number]["name"];

/** 화면에 쓰는 한글 카테고리 → 설문/미션 API가 쓰는 영문 코드. */
export const MISSION_CREATION_CATEGORY_CODES: Record<MissionCreationCategory, ApiMissionCategory> =
  {
    식비: "MEAL",
    교통: "TRANSPORT",
    취미: "HOBBY",
    생활: "LIVING",
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

export function buildMissionGeneratingHref(jobId: string) {
  const searchParams = new URLSearchParams({ jobId });
  return `/mission/new/generating?${searchParams}`;
}

export function buildMissionCreationResultHref(jobId: string) {
  const searchParams = new URLSearchParams({ jobId });
  return `/mission/new/result?${searchParams}`;
}
