import Constants from "expo-constants";
import { Platform } from "react-native";

/** WebView 대상과 API origin. app.config.ts의 `extra`에서 가져온다. */
const extra = (Constants.expoConfig?.extra ?? {}) as {
  webUrl?: string;
  apiUrl?: string;
};

const androidEmulatorEnv = process.env.EXPO_PUBLIC_ANDROID_EMULATOR;
// Android 에뮬레이터에서 호스트 localhost를 10.0.2.2로 매핑하려면
// EXPO_PUBLIC_ANDROID_EMULATOR=true. 실기기는 비워두거나 false로 두고 LAN 주소를 쓴다.
const isAndroidEmulator = __DEV__ && Platform.OS === "android" && androidEmulatorEnv === "true";
const DEFAULT_WEB_URL = isAndroidEmulator ? "http://10.0.2.2:3000" : "http://localhost:3000";
// Spring 로컬 기본 포트. 배포 환경은 EXPO_PUBLIC_API_URL로 지정.
const DEFAULT_API_URL = isAndroidEmulator
  ? "http://10.0.2.2:8080/api/"
  : "http://localhost:8080/api/";

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

// Metro가 인라인한 env 변수를 우선한다 — dev 빌드에 박힌 `extra`는 네이티브 빌드
// 시점에 고정되므로, .env를 바꿔도 여기 process.env로만 반영된다.
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

/** WebView가 로드할 수 있는 origin. 그 외는 외부로 연다. */
export const ORIGIN_WHITELIST = [WEB_URL];
