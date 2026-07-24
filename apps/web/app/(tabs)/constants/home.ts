import {
  ACTIVE_MISSIONS,
  MISSION_CATEGORIES,
  type Mission,
  type MissionCategory,
} from "../mission/constants/mission";

export type HomeMissionCategory = Exclude<MissionCategory, "취미">;

export const HOME_MISSION_CATEGORIES = MISSION_CATEGORIES.filter(
  (category): category is HomeMissionCategory => category !== "취미",
);

export type HomeMission = Mission;

export const HOME_MISSIONS = ACTIVE_MISSIONS;
