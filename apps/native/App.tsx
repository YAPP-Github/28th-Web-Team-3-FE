import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { initGuestAuth } from "./src/auth/guest-auth";
import { ORIGIN_WHITELIST, WEB_URL } from "./src/config";
import { authenticate, isBiometricAvailable } from "./src/native/biometric";
import { WebView } from "./src/webview";

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

  function retryLoad() {
    setLoadFailed(false);
    setReloadKey((key) => key + 1);
  }

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

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <StatusBar style="auto" />
      <WebView
        key={reloadKey}
        source={{ uri: WEB_URL }}
        originWhitelist={ORIGIN_WHITELIST}
        style={styles.webview}
        // 로드가 다시 성공하면 오버레이를 스스로 걷는다 — 안 그러면 화면이 멀쩡해진
        // 뒤에도 사용자가 "다시 시도"를 눌러 경로를 초기화해야만 빠져나올 수 있다.
        onLoad={() => setLoadFailed(false)}
        onError={() => setLoadFailed(true)}
        onHttpError={({ nativeEvent }) => {
          // onHttpError는 메인 프레임 응답만 올라온다. 4xx는 Next의 404 페이지처럼
          // 그려야 할 화면인 경우가 있으니, 페이지 자체를 못 그리는 5xx만 실패로 본다.
          if (nativeEvent.statusCode >= 500) setLoadFailed(true);
        }}
      />
      {loadFailed ? <LoadErrorView onRetry={retryLoad} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  webview: { flex: 1, marginTop: Platform.OS === "android" ? 0 : 44 },
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
