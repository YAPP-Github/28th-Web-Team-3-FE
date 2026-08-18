import * as SecureStore from "expo-secure-store";

const MISSION_CREATION_STARTED_KEY = "mission_creation_started";

/** 첫 생성 전용 CTA를 한 번만 노출하기 위해 기기별 생성 시작 이력을 보관한다. */
export async function hasStartedMissionCreation(): Promise<boolean> {
  return (await SecureStore.getItemAsync(MISSION_CREATION_STARTED_KEY)) === "true";
}

export function markMissionCreationStarted(): Promise<void> {
  return SecureStore.setItemAsync(MISSION_CREATION_STARTED_KEY, "true");
}
