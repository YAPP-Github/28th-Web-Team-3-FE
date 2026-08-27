import * as guestAuth from "./auth/guest-auth";
import * as missionCreationHistory from "./mission-generation/history";
import * as pendingMissionGeneration from "./mission-generation/pending-job";

/** 탈퇴한 게스트에 귀속된 인증·미션 생성 상태를 기기에서 함께 삭제한다. */
export async function clearGuestState(): Promise<void> {
  await Promise.all([
    guestAuth.clearGuestTokens(),
    missionCreationHistory.clearMissionCreationHistory(),
    pendingMissionGeneration.clearPendingMissionGeneration(),
  ]);
}
