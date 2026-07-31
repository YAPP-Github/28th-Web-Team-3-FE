import type { ExpoConfig } from "expo/config";

/**
 * Expo 설정. 네이티브 기능 플러그인은 미리 선언해둔다(App Store 4.2) — 생체인증·공유는
 * 구현돼 있고, 알림은 연결만 해두고 스텁 상태다. `extra.webUrl`은 WebView 대상이고
 * 환경별로 덮어쓸 수 있다.
 */
const config: ExpoConfig = {
  name: "아끼모",
  // slug·scheme·bundleIdentifier는 EAS 프로젝트와 스토어 등록에 묶인 식별자다.
  // 표시 이름(name)만 바꾸고 이쪽은 건드리지 않는다.
  slug: "web-team-3",
  version: "1.0.0",
  orientation: "portrait",
  scheme: "webteam3",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.webteam3.app",
    infoPlist: {
      // 생체인증을 호출할 때 iOS가 이유 문구를 보여주려면 필요하다.
      NSFaceIDUsageDescription: "앱 잠금 해제를 위해 Face ID를 사용합니다.",
    },
  },
  android: {
    package: "com.webteam3.app",
  },
  plugins: [
    "expo-dev-client",
    "expo-secure-store",
    [
      "expo-local-authentication",
      { faceIDPermission: "앱 잠금 해제를 위해 Face ID를 사용합니다." },
    ],
    "expo-notifications",
  ],
  experiments: {
    // React Compiler 활성화 — babel-preset-expo가 babel-plugin-react-compiler를 이 플래그로 켠다.
    reactCompiler: true,
  },
  extra: {
    // dev는 Next.js 앱을 서빙하는 Metro 호스트, prod는 배포된 웹 origin.
    // 폴백은 일부러 안 둔다 — 기본값은 config.ts가 플랫폼별로 챙긴다.
    webUrl: process.env.EXPO_PUBLIC_WEB_URL,
    // 게스트 인증 API(Spring) origin.
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
  },
};

export default config;
