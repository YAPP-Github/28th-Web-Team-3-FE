import type { MissionCategory as ApiMissionCategory } from "@repo/schema/mission";

export const MISSION_CATEGORIES = ["전체", "식비", "생활", "취미"] as const;

export type MissionCategory = (typeof MISSION_CATEGORIES)[number];

/** 기존 교통 미션도 표시할 수 있도록 백엔드 응답 전체의 한글 라벨은 유지한다. */
export const MISSION_CATEGORY_LABELS = {
  MEAL: "식비",
  TRANSPORT: "교통",
  HOBBY: "취미",
  LIVING: "생활",
} as const satisfies Record<ApiMissionCategory, string>;

/** 홈 카테고리 필터를 미션 API 쿼리 값으로 변환한다. */
export const MISSION_CATEGORY_VALUES: Record<MissionCategory, ApiMissionCategory | null> = {
  전체: null,
  식비: "MEAL",
  생활: "LIVING",
  취미: "HOBBY",
};
