import type { MissionCategory as ApiMissionCategory } from "@repo/schema/mission";

export const MISSION_CATEGORIES = ["전체", "식비", "교통", "취미", "생활"] as const;

export type MissionCategory = (typeof MISSION_CATEGORIES)[number];

/** 백엔드 카테고리(영문 enum) → 화면 표시용 한글 라벨. */
export const MISSION_CATEGORY_LABELS: Record<
  ApiMissionCategory,
  Exclude<MissionCategory, "전체">
> = {
  MEAL: "식비",
  TRANSPORT: "교통",
  HOBBY: "취미",
  LIVING: "생활",
};
