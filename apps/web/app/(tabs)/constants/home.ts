import { MISSION_CATEGORIES, type MissionCategory } from "../mission/constants/mission";

export type HomeMissionCategory = Exclude<MissionCategory, "취미">;

export const HOME_MISSION_CATEGORIES = MISSION_CATEGORIES.filter(
  (category): category is HomeMissionCategory => category !== "취미",
);
