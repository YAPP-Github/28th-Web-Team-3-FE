import * as SecureStore from "expo-secure-store";

const MISSION_CREATION_STARTED_KEY = "mission_creation_started";

function getSeoulDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Seoul",
    year: "numeric",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;

  return `${value("year")}-${value("month")}-${value("day")}`;
}

/** 첫 생성 전용 CTA를 한 번만 노출하기 위해 기기별 생성 시작 이력을 보관한다. */
export async function hasStartedMissionCreation(): Promise<boolean> {
  return (await SecureStore.getItemAsync(MISSION_CREATION_STARTED_KEY)) !== null;
}

export async function getMissionCreationStartDate(): Promise<string | null> {
  const value = await SecureStore.getItemAsync(MISSION_CREATION_STARTED_KEY);
  return value === "true" ? null : value;
}

export async function markMissionCreationStarted(): Promise<void> {
  if (await SecureStore.getItemAsync(MISSION_CREATION_STARTED_KEY)) return;
  await SecureStore.setItemAsync(MISSION_CREATION_STARTED_KEY, getSeoulDate());
}
