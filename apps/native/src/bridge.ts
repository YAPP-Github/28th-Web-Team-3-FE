import type { AppBridgeMethods, NativeInfo } from "@repo/bridge/types";
import { bridge } from "@webview-bridge/react-native";
import Constants from "expo-constants";
import { Platform } from "react-native";
import * as guestAuth from "./auth/guest-auth";
import * as biometric from "./native/biometric";
import * as link from "./native/link";
import * as push from "./native/push";
import * as share from "./native/share";

async function getNativeInfo(): Promise<NativeInfo> {
  return {
    platform: Platform.OS === "ios" ? "ios" : "android",
    // Source of truth is app.config.ts (expo.version), surfaced via Constants.
    appVersion: Constants.expoConfig?.version ?? "unknown",
    biometricAvailable: await biometric.isBiometricAvailable(),
  };
}

/**
 * Native implementation of the shared bridge contract. `satisfies AppBridge` makes
 * the compiler enforce that this matches exactly what the web app expects to call.
 */
const handlers = {
  authenticate: (reason?: string) => biometric.authenticate(reason),
  share: (payload) => share.open(payload),
  openExternal: (url) => link.openExternal(url),
  getPushToken: () => push.getToken(), // stub
  registerPush: () => push.register(), // stub
  getNativeInfo,
  getAccessToken: () => guestAuth.getAccessToken(),
  refreshAccessToken: () => guestAuth.refreshAccessToken(),
} satisfies AppBridgeMethods;

export const appBridge = bridge(handlers);

export type NativeAppBridge = typeof appBridge;
