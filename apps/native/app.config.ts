import type { ExpoConfig } from "expo/config";

/** @repo/ui의 --color-blue-500. 웹 토큰을 네이티브에서 참조할 수 없어 값만 맞춰 둔다. */
const BRAND_BLUE = "#00aeff";

/** 빌드 서버에서만 닿을 수 있는 주소. 사용자 기기에서는 아무것도 못 띄운다. */
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

/**
 * 릴리스 빌드가 WebView·API 주소 없이 나가지 않게 막는다.
 *
 * `src/config.ts`도 같은 값을 요구하지만 거기서 던지면 **사용자 기기에서** 첫 렌더 전에
 * 앱이 죽는다 — 심사자가 스플래시 뒤 즉시 종료를 본다(App Store 2.1). 여기서 던지면 빌드가
 * 실패해 잘못된 바이너리가 애초에 안 나온다.
 *
 * `preview`도 함께 본다. `developmentClient`가 없는 릴리스 빌드라 `__DEV__`가 false고,
 * `requireInProd`가 폴백 대신 던진다 — 값이 비면 테스터 기기에서 똑같이 부팅하자마자 죽는다.
 * 로컬 기본값(localhost)으로 도는 건 `expo start`로 붙는 dev 빌드뿐이다.
 *
 * `EAS_BUILD_PROFILE`은 EAS 빌트인 변수라 로컬 app config 평가에는 주입되지 않는다. 이 가드는
 * 빌더가 prebuild하며 config를 평가할 때 처음 돌고, 그 시점에는 프로필에 대응하는 EAS 환경
 * 변수가 이미 실려 있다. 로컬에서 안 도는 편이 오히려 안전하다 — secret 가시성 변수는 로컬에서
 * 읽히지 않아 정상 빌드를 거짓으로 막게 된다.
 */
const RELEASE_PROFILES = new Set(["production", "preview"]);

function assertReleaseEnv(): void {
  const profile = process.env.EAS_BUILD_PROFILE;
  if (!profile || !RELEASE_PROFILES.has(profile)) return;

  for (const key of ["EXPO_PUBLIC_WEB_URL", "EXPO_PUBLIC_API_URL"] as const) {
    const value = process.env[key]?.trim();
    if (!value) {
      throw new Error(
        `${key}가 없다. ${profile} 빌드에 필요하다. ` +
          `\`cd apps/native && eas env:push ${profile} --path .env.${profile}\`로 반영해라.`,
      );
    }

    // 문자열 검사로는 부족하다 — "https://"는 접두사 검사를 통과하지만 호스트가 없어
    // `new URL()`이 던지고, 앱은 config.ts의 WEB_ORIGIN 계산에서 시작하자마자 죽는다.
    let parsed: URL;
    try {
      parsed = new URL(value);
    } catch {
      throw new Error(`${key}를 URL로 읽을 수 없다. 지금 값: ${value}`);
    }
    if (parsed.protocol !== "https:") {
      throw new Error(`${key}는 https여야 한다. 지금 값: ${value}`);
    }
    if (LOCAL_HOSTNAMES.has(parsed.hostname)) {
      throw new Error(`${key}가 로컬 주소다. 사용자 기기에서는 열리지 않는다. 지금 값: ${value}`);
    }
  }
}

assertReleaseEnv();

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
  version: "1.1.3",
  orientation: "portrait",
  scheme: "akkimo",
  userInterfaceStyle: "automatic",
  icon: "./assets/icon.png",
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.akkimo.app",
    infoPlist: {
      // 생체인증을 호출할 때 iOS가 이유 문구를 보여주려면 필요하다.
      NSFaceIDUsageDescription: "앱 잠금 해제를 위해 Face ID를 사용합니다.",
      ITSAppUsesNonExemptEncryption: false,
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
    eas: {
      projectId: "849056a3-f28a-4c3e-9b66-a1da6f661c7f",
    },
    // dev는 Next.js 앱을 서빙하는 Metro 호스트, prod는 배포된 웹 origin.
    // 폴백은 일부러 안 둔다 — 기본값은 config.ts가 플랫폼별로 챙긴다.
    webUrl: process.env.EXPO_PUBLIC_WEB_URL,
    // 게스트 인증 API(Spring) origin.
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
  },
};

export default config;
