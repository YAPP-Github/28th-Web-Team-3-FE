import type { BridgeWebView } from "@webview-bridge/react-native";
import { StatusBar } from "expo-status-bar";
import { type ReactNode, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { initGuestAuth } from "./src/auth/guest-auth";
import { WEB_ORIGIN, WEB_URL } from "./src/config";
import { isAllowedExternalUrl, isTrustedWebViewUrl } from "./src/lib/trusted-url";
import { authenticate, isBiometricAvailable } from "./src/native/biometric";
import { getSafeAreaColors, subscribeSafeAreaColors } from "./src/native/safe-area";
import { WebView } from "./src/webview";

/**
 * 렌더러 사망을 연속 몇 번까지 조용히 되살릴지. 계속 죽는 기기에서 remount를
 * 무한 반복하며 배터리를 태우는 대신, 넘어가면 오버레이를 띄워 사용자가 판단하게 한다.
 */
const MAX_AUTO_RECOVERY = 3;

/**
 * 직전 복구로부터 이만큼 지났으면 연속이 아니라 별개의 사고로 보고 횟수를 리셋한다.
 * 누적으로 세면 몇 시간에 한 번씩 죽는 기기가 긴 세션 도중 복구를 영구히 잃는다.
 * 반대로 성공한 로드마다 리셋하면 "죽고 → 잘 뜨고 → 또 죽는" 루프에서 상한이 통째로
 * 무력해진다 — 그래서 로드 성공이 아니라 시간 간격을 기준으로 판단한다.
 */
const RECOVERY_RESET_MS = 60_000;

/**
 * 웹을 못 불러왔을 때 덮는 화면. 없으면 흰 화면만 남아 사용자도, 심사자도
 * 원인을 알 수 없다 — 앱이 고장 난 것으로 읽힌다.
 */
function LoadErrorView({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={[StyleSheet.absoluteFill, styles.center, styles.errorSurface]}>
      <Text style={styles.errorTitle}>페이지를 불러오지 못했어요</Text>
      <Text style={styles.errorBody}>네트워크 상태를 확인하고 다시 시도해 주세요.</Text>
      <Pressable accessibilityRole="button" style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryLabel}>다시 시도</Text>
      </Pressable>
    </View>
  );
}

/**
 * App shell. Boot order:
 *   biometric unlock -> guest 토큰 발급 시작(await 안 함) -> WebView 진입.
 * 토큰 발급은 기다리지 않는다 — 느린 네트워크에서 부트가 스피너에 갇히지 않도록.
 * 발급은 single-flight라, 웹의 첫 bridge.getAccessToken()이 같은 발급을 공유·대기한다.
 */
export default function App() {
  const [ready, setReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  // WebView를 remount해 재시도한다 — ref.reload()는 로드 자체가 실패한 상태에서 안 먹는다.
  const [reloadKey, setReloadKey] = useState(0);
  // remount할 주소. key와 짝으로 바뀐다 — 같은 주소로 되살릴 때도 뷰는 새로 만들어야 한다.
  const [source, setSource] = useState({ uri: WEB_URL });
  // 5xx는 본문(Next 에러 페이지)이 함께 오므로 onHttpError 뒤에 onLoad까지 발화한다.
  // 둘의 발화 순서는 보장되지 않아, onLoad에서 무조건 걷으면 오버레이가 도로 사라진다.
  // 이번 내비게이션에서 실패가 있었는지를 따로 들고 있다가 성공한 로드에서만 걷는다.
  const navigationFailedRef = useRef(false);
  const webViewRef = useRef<BridgeWebView>(null);
  // 되돌릴 웹 히스토리가 있는지. 화면을 다시 그릴 필요가 없어 state가 아니라 ref다.
  const canGoBackRef = useRef(false);
  // 지금 보고 있는 주소. 렌더러가 죽었을 때 여기로 되살린다. Next.js의 pushState 이동도
  // onNavigationStateChange로 올라오므로 SPA로 옮겨 다닌 화면까지 따라온다.
  const currentUrlRef = useRef(WEB_URL);
  const autoRecoveryCountRef = useRef(0);
  const lastRecoveryAtRef = useRef(0);

  function markLoadFailed() {
    navigationFailedRef.current = true;
    setLoadFailed(true);
  }

  function remount(uri: string) {
    setLoadFailed(false);
    // 뷰를 새로 만들면 히스토리도 함께 비워진다.
    canGoBackRef.current = false;
    // 새 주소를 여기서 바로 반영한다 — onNavigationStateChange를 기다리면, 그 전에
    // 렌더러가 또 죽었을 때 이미 떠난 주소로 되살린다. 재시도로 첫 화면을 연 직후
    // 죽으면 방금 실패한 화면으로 돌아가는 식이다.
    currentUrlRef.current = uri;
    setSource({ uri });
    setReloadKey((key) => key + 1);
  }

  /**
   * 오버레이의 "다시 시도". 보던 주소가 아니라 첫 화면으로 되돌린다 — 여기까지 왔다는 건
   * 그 주소가 실패했다는 뜻이라, 같은 곳으로 다시 보내면 빠져나올 길이 없다.
   */
  function retryLoad() {
    remount(WEB_URL);
  }

  /**
   * 렌더러 프로세스가 죽으면 WebView는 스스로 되살아나지 못한다. 라이브러리도
   * 이벤트만 넘겨줄 뿐 아무것도 하지 않아, 두면 죽은 뷰가 흰 화면으로 남는다.
   * 사용자 잘못이 아니므로 조용히 뷰를 새로 만들되 횟수는 제한한다.
   *
   * 여기서는 보던 주소로 되살린다 — 페이지 자체는 멀쩡했고 프로세스만 죽은 것이라,
   * 첫 화면으로 되돌리면 온보딩 중이던 사용자를 처음부터 다시 시작하게 만든다.
   */
  function recoverFromRendererLoss() {
    const now = Date.now();
    if (now - lastRecoveryAtRef.current > RECOVERY_RESET_MS) {
      autoRecoveryCountRef.current = 0;
    }
    lastRecoveryAtRef.current = now;

    if (autoRecoveryCountRef.current >= MAX_AUTO_RECOVERY) {
      markLoadFailed();
      return;
    }
    autoRecoveryCountRef.current += 1;
    remount(currentUrlRef.current);
  }

  // Android 뒤로가기. 핸들러가 없으면 어느 화면에서 눌러도 앱이 그대로 종료된다.
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      // 되돌릴 곳이 없을 때만 false를 넘겨 기본 동작(앱 종료)에 맡긴다.
      if (!canGoBackRef.current) return false;
      webViewRef.current?.goBack();
      return true;
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    (async () => {
      if (await isBiometricAvailable()) {
        // On failure we still proceed — 게스트 인증이라 잠금 실패가 치명적이지 않다.
        await authenticate("앱 잠금 해제").catch(() => false);
      }
      // fire-and-forget: 발급 완료를 기다리지 않고 바로 진입.
      void initGuestAuth();
      setReady(true);
    })();
  }, []);

  return (
    <SafeAreaProvider>
      {/* 웹은 라이트 전용이다(@repo/ui globals.css에 prefers-color-scheme 분기 없음).
          "auto"면 다크모드 기기에서 밝은 글자로 그려져 웹의 흰 헤더 위에서 안 보인다.
          웹이 다크모드를 지원하면 "auto"로 되돌린다. */}
      <StatusBar style="dark" />
      <SafeAreaBands>
        {ready ? (
          <>
            <WebView
              key={reloadKey}
              ref={webViewRef}
              source={source}
              // iOS 가장자리 스와이프로 뒤로가기. 없으면 웹 UI에 뒤로 버튼이 없는 화면에
              // 들어갔을 때 빠져나올 방법이 없다 — Android는 아래 BackHandler가 맡는다.
              allowsBackForwardNavigationGestures
              // 라이브러리는 originWhitelist를 콜백보다 먼저 돌리고, 걸러낸 URL을
              // 아래 콜백에 알리지도 않은 채 그대로 Linking으로 열어버린다. `*`로 열어
              // 모든 내비게이션이 콜백에 도달하게 하고 판정은 한 곳에서만 한다.
              originWhitelist={["*"]}
              // 기본값(true)이면 target="_blank"·window.open 내비게이션이
              // onShouldStartLoadWithRequest에 오지 않고 조용히 사라진다 — 사용자는
              // 링크를 눌렀는데 아무 일도 안 일어나는 화면을 본다.
              setSupportMultipleWindows={false}
              style={styles.webview}
              onShouldStartLoadWithRequest={(request) => {
                // origin 완전 일치를 통과한 페이지에만 브릿지가 주입된다 — 느슨하면
                // getAccessToken/refreshAccessToken으로 토큰이 샌다.
                if (isTrustedWebViewUrl(request.url, WEB_ORIGIN)) return true;
                // 우리 origin이 아니면 WebView에는 띄우지 않는다. 그중 브라우저·메일·전화로
                // 끝나는 스킴만 OS에 넘기고, intent:/file:/javascript: 같은 나머지는
                // 아무것도 열지 않는다.
                if (isAllowedExternalUrl(request.url)) {
                  void Linking.openURL(request.url).catch(() => {});
                }
                return false;
              }}
              // 응답보다 먼저 도는 시점이라 여기서 이번 내비게이션의 실패 여부를 초기화한다.
              onLoadStart={() => {
                navigationFailedRef.current = false;
              }}
              // 실패 없이 끝난 로드만 오버레이를 걷는다 — 안 그러면 화면이 멀쩡해진 뒤에도
              // 사용자가 "다시 시도"를 눌러 경로를 초기화해야만 빠져나올 수 있다.
              onLoad={() => {
                if (!navigationFailedRef.current) setLoadFailed(false);
              }}
              // Next.js의 pushState 이동에도 발화한다 — Android는 방문 기록이 바뀔 때마다
              // 이 이벤트를 쏘므로 SPA 화면 이동이 canGoBack에 그대로 반영된다.
              onNavigationStateChange={({ canGoBack, url }) => {
                canGoBackRef.current = canGoBack;
                // about:blank은 WebView가 초기화 중 스스로 로드하는 값이라 복구 대상이
                // 아니다. 우리 origin이 아닌 주소는 애초에 여기 뜨지 않지만, 복구 시
                // 로드할 주소라 한 번 더 확인하고 넣는다.
                if (url !== "about:blank" && isTrustedWebViewUrl(url, WEB_ORIGIN)) {
                  currentUrlRef.current = url;
                }
              }}
              onError={markLoadFailed}
              // Android 렌더러 종료 / iOS 콘텐츠 프로세스 종료. 앱은 살아있지만 WebView만 죽는다.
              onRenderProcessGone={recoverFromRendererLoss}
              onContentProcessDidTerminate={recoverFromRendererLoss}
              onHttpError={({ nativeEvent }) => {
                // onHttpError는 메인 프레임 응답만 올라온다. 4xx는 Next의 404 페이지처럼
                // 그려야 할 화면인 경우가 있으니, 페이지 자체를 못 그리는 5xx만 실패로 본다.
                if (nativeEvent.statusCode >= 500) markLoadFailed();
              }}
            />
            {loadFailed ? <LoadErrorView onRetry={retryLoad} /> : null}
          </>
        ) : (
          <View style={styles.center}>
            <ActivityIndicator size="large" />
          </View>
        )}
      </SafeAreaBands>
    </SafeAreaProvider>
  );
}

/**
 * 상·하 인셋의 주인은 여기 한 곳이다. Expo 57(RN 0.86)은 Android edge-to-edge가 강제라
 * (prebuild가 statusBar/navigationBarColor를 transparent로 박는다) 하단을 비워 두면 시스템
 * 제스처바가 웹의 고정 탭바를 덮는다. 웹은 그래서 자기 쪽에 safe-area 여백을 두지 않는다 —
 * 양쪽이 넣으면 여백이 이중으로 들어간다.
 *
 * `SafeAreaView` 하나로 감싸면 상·하가 같은 색이 된다. 시안은 화면마다 상단 밴드가 히어로
 * 배경을 이어받으므로(혜택은 blue-50, 미션은 gray-50) 밴드를 따로 그려 색을 나눈다. 색이
 * 없으면 인셋 밴드에 DayNight 루트 배경이 드러나 다크모드에서 흰 웹 화면 위아래로 회색 띠가
 * 생긴다.
 *
 * 색만 이 컴포넌트에서 구독한다 — `children`은 App이 만든 엘리먼트 그대로라 색이 바뀌어도
 * WebView가 리렌더되지 않는다.
 */
function SafeAreaBands({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const colors = useSyncExternalStore(subscribeSafeAreaColors, getSafeAreaColors);

  return (
    <View style={styles.root}>
      <View style={{ height: insets.top, backgroundColor: colors.top }} />
      <View style={styles.content}>{children}</View>
      <View style={{ height: insets.bottom, backgroundColor: colors.bottom }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  // 밴드 사이 본문. 색이 없으면 부트 스피너 구간과 WebView 첫 프레임 전에 Android
  // DayNight 루트 배경이 드러난다 — 다크모드 기기에서 회색 화면으로 보인다.
  content: { flex: 1, backgroundColor: "#ffffff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  webview: { flex: 1 },
  errorSurface: { backgroundColor: "#ffffff", gap: 8, paddingHorizontal: 24 },
  errorTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  errorBody: { fontSize: 14, color: "#6b7280", textAlign: "center" },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#111827",
  },
  retryLabel: { fontSize: 15, fontWeight: "600", color: "#ffffff" },
});
