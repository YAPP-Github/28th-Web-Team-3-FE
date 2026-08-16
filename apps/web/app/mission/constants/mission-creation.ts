import type { ActiveMissionCategory } from "@repo/schema/mission";

export const MISSION_RECOMMENDATION_CATEGORIES = [
  { description: "일주일에 2번, 집밥으로 점심 해결하기", name: "식비" },
  { description: "무지출 데이 1회", name: "생활" },
  { description: "이번 달 구독료 1개 해지", name: "취미" },
] as const;

export type MissionCreationCategory = (typeof MISSION_RECOMMENDATION_CATEGORIES)[number]["name"];

/** 화면에 쓰는 한글 카테고리 → 설문/미션 API가 쓰는 영문 코드. */
export const MISSION_CREATION_CATEGORY_CODES = {
  식비: "MEAL",
  취미: "HOBBY",
  생활: "LIVING",
} as const satisfies Record<MissionCreationCategory, ActiveMissionCategory>;

export function buildMissionLoadingHref(jobId: string) {
  const searchParams = new URLSearchParams({ jobId });
  return `/mission/new/loading?${searchParams}`;
}

export function buildMissionCreationResultHref(jobId: string) {
  const searchParams = new URLSearchParams({ jobId });
  return `/mission/new/result?${searchParams}`;
}
