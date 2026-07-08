import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { initGuestAuth } from "./src/auth/guestAuth";
import { ORIGIN_WHITELIST, WEB_URL } from "./src/config";
import { authenticate, isBiometricAvailable } from "./src/native/biometric";
import { WebView } from "./src/webview";

/**
 * App shell. Boot order:
 *   biometric unlock -> guest 토큰 준비(refresh 갱신 or 신규 발급) -> WebView 진입.
 * 토큰 준비가 실패해도(오프라인 등) 진입은 막지 않는다 — 웹의 API 호출이
 * bridge.getAccessToken()을 통해 발급을 다시 시도한다.
 */
export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      if (await isBiometricAvailable()) {
        // On failure we still proceed — 게스트 인증이라 잠금 실패가 치명적이지 않다.
        await authenticate("앱 잠금 해제").catch(() => false);
      }
      await initGuestAuth();
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
        source={{ uri: WEB_URL }}
        originWhitelist={ORIGIN_WHITELIST}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  webview: { flex: 1, marginTop: Platform.OS === "android" ? 0 : 44 },
});
