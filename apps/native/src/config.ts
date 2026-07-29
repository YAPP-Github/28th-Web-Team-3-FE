import Constants from "expo-constants";
import { Platform } from "react-native";

/** WebView target + API origin, resolved from app.config.ts `extra`. */
const extra = (Constants.expoConfig?.extra ?? {}) as {
  webUrl?: string;
  apiUrl?: string;
};

const androidEmulatorEnv = process.env.EXPO_PUBLIC_ANDROID_EMULATOR;
// Dev-only defaults: 10.0.2.2 is the Android emulator's loopback alias for the
// host machine. Physical devices should keep this unset/false and use a LAN URL.
const isAndroidEmulator = __DEV__ && Platform.OS === "android" && androidEmulatorEnv === "true";
const DEFAULT_WEB_URL = isAndroidEmulator ? "http://10.0.2.2:3000" : "http://localhost:3000";
// Spring 로컬 기본 포트. 배포 환경은 EXPO_PUBLIC_API_URL로 지정.
const DEFAULT_API_URL = isAndroidEmulator ? "http://10.0.2.2:8080" : "http://localhost:8080";

// 프로덕션 빌드에서 env 누락 시 localhost로 조용히 폴백하면 WebView가 빈 화면으로
// 죽어 원인 추적이 어렵다 — 설정 실수는 첫 부팅에서 즉시 크래시로 드러낸다.
function requireInProd(value: string | undefined, fallback: string, envName: string): string {
  if (value) return value;
  if (!__DEV__) throw new Error(`${envName} must be set in production builds`);
  return fallback;
}

function resolveDevHostUrl(url: string): string {
  if (!isAndroidEmulator) return url;
  return url.replace("://localhost", "://10.0.2.2").replace("://127.0.0.1", "://10.0.2.2");
}

function ensureTrailingSlash(url: string): string {
  return url.endsWith("/") ? url : `${url}/`;
}

// Prefer the Metro-inlined env var: a dev build's embedded `extra` is frozen at
// native build time, so .env changes only take effect through process.env here.
export const WEB_URL = resolveDevHostUrl(
  requireInProd(
    process.env.EXPO_PUBLIC_WEB_URL ?? extra.webUrl,
    DEFAULT_WEB_URL,
    "EXPO_PUBLIC_WEB_URL",
  ),
);
export const API_URL = ensureTrailingSlash(
  resolveDevHostUrl(
    requireInProd(
      process.env.EXPO_PUBLIC_API_URL ?? extra.apiUrl,
      DEFAULT_API_URL,
      "EXPO_PUBLIC_API_URL",
    ),
  ),
);

/** Origins the WebView is allowed to load. Anything else opens externally. */
export const ORIGIN_WHITELIST = [WEB_URL];
