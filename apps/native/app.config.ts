import type { ExpoConfig } from "expo/config";

/**
 * Expo config. Native capability plugins are declared up-front (App Store 4.2):
 * biometric + sharing are implemented; notifications is wired but stubbed.
 * `extra.webUrl` is the WebView target, overridable per environment.
 */
const config: ExpoConfig = {
  name: "Web Team 3",
  slug: "web-team-3",
  version: "1.0.0",
  orientation: "portrait",
  scheme: "webteam3",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.webteam3.app",
    infoPlist: {
      // Required so iOS shows a reason string when biometric auth is invoked.
      NSFaceIDUsageDescription: "앱 잠금 해제를 위해 Face ID를 사용합니다.",
    },
  },
  android: {
    package: "com.webteam3.app",
  },
  plugins: [
    "expo-secure-store",
    [
      "expo-local-authentication",
      { faceIDPermission: "앱 잠금 해제를 위해 Face ID를 사용합니다." },
    ],
    "expo-notifications",
  ],
  extra: {
    // dev: Metro host serving the Next.js app; prod: the deployed web origin.
    // Intentionally no fallback — config.ts provides platform-aware defaults.
    webUrl: process.env.EXPO_PUBLIC_WEB_URL,
    cookieDomain: process.env.EXPO_PUBLIC_COOKIE_DOMAIN,
  },
};

export default config;
