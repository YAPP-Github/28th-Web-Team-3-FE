import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { initGuestAuth } from "./src/auth/guestAuth";
import { ORIGIN_WHITELIST, WEB_URL } from "./src/config";
import { authenticate, isBiometricAvailable } from "./src/native/biometric";
import { WebView } from "./src/webview";

/**
 * App shell. Boot order:
 *   biometric unlock -> guest 토큰 발급 시작(await 안 함) -> WebView 진입.
 * 토큰 발급은 기다리지 않는다 — 느린 네트워크에서 부트가 스피너에 갇히지 않도록.
 * 발급은 single-flight라, 웹의 첫 bridge.getAccessToken()이 같은 발급을 공유·대기한다.
 */
export default function App() {
  const [ready, setReady] = useState(false);

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
