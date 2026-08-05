import type { ExpoConfig } from "expo/config";

/** @repo/ui의 --color-blue-500. 웹 토큰을 네이티브에서 참조할 수 없어 값만 맞춰 둔다. */
const BRAND_BLUE = "#00aeff";

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
  scheme: "akkimo",
  userInterfaceStyle: "automatic",
  icon: "./assets/icon.png",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.akkimo.app",
    infoPlist: {
      // 생체인증을 호출할 때 iOS가 이유 문구를 보여주려면 필요하다.
      NSFaceIDUsageDescription: "앱 잠금 해제를 위해 Face ID를 사용합니다.",
    },
  },
  android: {
    package: "com.akkimo.app",
    // 어댑티브 아이콘은 가장자리를 기기 모양대로 잘라내므로, icon.png를 그대로 쓰면
    // 아래쪽 귀가 먹힌다. foreground는 마크를 안전 영역(66%) 안으로 넣은 별도 파일이다.
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: BRAND_BLUE,
    },
  },
  plugins: [
    "expo-dev-client",
    "expo-secure-store",
    [
      "expo-local-authentication",
      { faceIDPermission: "앱 잠금 해제를 위해 Face ID를 사용합니다." },
    ],
    "expo-notifications",
    [
      "expo-splash-screen",
      {
        image: "./assets/splash-icon.png",
        backgroundColor: BRAND_BLUE,
        // 표시 너비는 160dp. 원본(478px)이 3x 기기의 480px를 채우므로 업스케일이 없다.
        imageWidth: 160,
      },
    ],
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
