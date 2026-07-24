import { ACTIVE_MISSIONS, type Mission } from "../mission/constants/mission";

export const HOME_MISSION_CATEGORIES = ["전체", "식비", "교통", "생활"] as const;

export type HomeMissionCategory = (typeof HOME_MISSION_CATEGORIES)[number];

export type HomeMission = Mission;

export const HOME_MISSIONS = ACTIVE_MISSIONS;
