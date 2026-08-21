import type { AppBridgeMethods, NativeInfo } from "@repo/bridge/types";
import { bridge } from "@webview-bridge/react-native";
import Constants from "expo-constants";
import { Platform } from "react-native";
import * as guestAuth from "./auth/guest-auth";
import * as missionCreationHistory from "./mission-generation/history";
import * as pendingMissionGeneration from "./mission-generation/pending-job";
import * as biometric from "./native/biometric";
import * as link from "./native/link";
import * as push from "./native/push";
import * as safeArea from "./native/safe-area";
import * as share from "./native/share";

async function getNativeInfo(): Promise<NativeInfo> {
  return {
    platform: Platform.OS === "ios" ? "ios" : "android",
    // 원본은 app.config.ts(expo.version)이고, Constants로 가져온다.
    appVersion: Constants.expoConfig?.version ?? "unknown",
    biometricAvailable: await biometric.isBiometricAvailable(),
  };
}

/**
 * 공유 브릿지 계약의 네이티브 구현. `satisfies AppBridge`로 웹이 기대하는 모양과
 * 정확히 맞는지 컴파일러가 강제하게 한다.
 */
const handlers = {
  authenticate: (reason?: string) => biometric.authenticate(reason),
  share: (payload) => share.open(payload),
  openExternal: (url) => link.openExternal(url),
  getPushToken: () => push.getToken(), // stub
  registerPush: () => push.register(), // stub
  getNativeInfo,
  setSafeAreaColor: async (top, bottom) => safeArea.setColors(top, bottom),
  getAccessToken: () => guestAuth.getAccessToken(),
  refreshAccessToken: () => guestAuth.refreshAccessToken(),
  clearGuestTokens: () => guestAuth.clearGuestTokens(),
  savePendingMissionGeneration: (job) => pendingMissionGeneration.savePendingMissionGeneration(job),
  getPendingMissionGeneration: () => pendingMissionGeneration.getPendingMissionGeneration(),
  clearPendingMissionGeneration: (jobId) =>
    pendingMissionGeneration.clearPendingMissionGeneration(jobId),
  hasStartedMissionCreation: () => missionCreationHistory.hasStartedMissionCreation(),
  getMissionCreationStartDate: () => missionCreationHistory.getMissionCreationStartDate(),
  markMissionCreationStarted: () => missionCreationHistory.markMissionCreationStarted(),
} satisfies AppBridgeMethods;

export const appBridge = bridge(handlers);
