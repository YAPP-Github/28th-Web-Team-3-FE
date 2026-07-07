import Constants from "expo-constants";
import { Platform } from "react-native";

/** WebView target + API origin, resolved from app.config.ts `extra`. */
const extra = (Constants.expoConfig?.extra ?? {}) as {
  webUrl?: string;
  apiUrl?: string;
};

// Dev-only defaults: 10.0.2.2 is the Android emulator's loopback alias for the
// host machine. Physical devices must override via EXPO_PUBLIC_WEB_URL.
const isAndroidEmulator = __DEV__ && Platform.OS === "android";
const DEFAULT_WEB_URL = isAndroidEmulator ? "http://10.0.2.2:3000" : "http://localhost:3000";
// Spring 로컬 기본 포트. 배포 환경은 EXPO_PUBLIC_API_URL로 지정.
const DEFAULT_API_URL = isAndroidEmulator ? "http://10.0.2.2:8080" : "http://localhost:8080";

// Prefer the Metro-inlined env var: a dev build's embedded `extra` is frozen at
// native build time, so .env changes only take effect through process.env here.
export const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? extra.webUrl ?? DEFAULT_WEB_URL;
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? extra.apiUrl ?? DEFAULT_API_URL;

/** Origins the WebView is allowed to load. Anything else opens externally. */
export const ORIGIN_WHITELIST = [WEB_URL];
