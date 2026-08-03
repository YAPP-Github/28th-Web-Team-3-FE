import type { BridgeWebView } from "@webview-bridge/react-native";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
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
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { initGuestAuth } from "./src/auth/guest-auth";
import { ORIGIN_WHITELIST, WEB_ORIGIN, WEB_URL } from "./src/config";
import { isTrustedWebViewUrl } from "./src/lib/trusted-url";
import { authenticate, isBiometricAvailable } from "./src/native/biometric";
import { WebView } from "./src/webview";

/**
 * 렌더러 사망을 앱 실행당 몇 번까지 조용히 되살릴지. 계속 죽는 기기에서 remount를
 * 무한 반복하며 배터리를 태우는 대신, 넘어가면 오버레이를 띄워 사용자가 판단하게 한다.
 */
const MAX_AUTO_RECOVERY = 3;

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
  // 5xx는 본문(Next 에러 페이지)이 함께 오므로 onHttpError 뒤에 onLoad까지 발화한다.
  // 둘의 발화 순서는 보장되지 않아, onLoad에서 무조건 걷으면 오버레이가 도로 사라진다.
  // 이번 내비게이션에서 실패가 있었는지를 따로 들고 있다가 성공한 로드에서만 걷는다.
  const navigationFailedRef = useRef(false);
  const webViewRef = useRef<BridgeWebView>(null);
  // 되돌릴 웹 히스토리가 있는지. 화면을 다시 그릴 필요가 없어 state가 아니라 ref다.
  const canGoBackRef = useRef(false);
  const autoRecoveryCountRef = useRef(0);

  function markLoadFailed() {
    navigationFailedRef.current = true;
    setLoadFailed(true);
  }

  function retryLoad() {
    setLoadFailed(false);
    // 뷰를 새로 만들면 히스토리도 함께 비워진다.
    canGoBackRef.current = false;
    setReloadKey((key) => key + 1);
  }

  /**
   * 렌더러 프로세스가 죽으면 WebView는 스스로 되살아나지 못한다. 라이브러리도
   * 이벤트만 넘겨줄 뿐 아무것도 하지 않아, 두면 죽은 뷰가 흰 화면으로 남는다.
   * 사용자 잘못이 아니므로 조용히 뷰를 새로 만들되 횟수는 제한한다.
   */
  function recoverFromRendererLoss() {
    if (autoRecoveryCountRef.current >= MAX_AUTO_RECOVERY) {
      markLoadFailed();
      return;
    }
    autoRecoveryCountRef.current += 1;
    retryLoad();
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
      <StatusBar style="auto" />
      <SafeAreaView edges={["top"]} style={styles.flex}>
        {ready ? (
          <>
            <WebView
              key={reloadKey}
              ref={webViewRef}
              source={{ uri: WEB_URL }}
              originWhitelist={ORIGIN_WHITELIST}
              style={styles.webview}
              // originWhitelist는 접두사만 맞아도 통과시키므로 여기서 origin 완전 일치를
              // 강제한다. 이 검사를 통과한 페이지에만 브릿지가 주입된다 — 느슨하면
              // getAccessToken/refreshAccessToken으로 토큰이 샌다.
              onShouldStartLoadWithRequest={(request) => {
                if (isTrustedWebViewUrl(request.url, WEB_ORIGIN)) return true;
                // 우리 origin이 아니면 WebView에 띄우지 않고 OS에 넘긴다.
                void Linking.openURL(request.url).catch(() => {});
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
              onNavigationStateChange={({ canGoBack }) => {
                canGoBackRef.current = canGoBack;
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
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
