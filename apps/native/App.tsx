import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { ORIGIN_WHITELIST, WEB_URL } from "./src/config";
import { authenticate, isBiometricAvailable } from "./src/native/biometric";
import { captureCookieFromWebView, injectStoredCookie } from "./src/session/cookie";
import { WebView } from "./src/webview";

/**
 * App shell. Boot order (decision #5):
 *   biometric unlock -> load cookie from SecureStore -> inject into WebView -> navigate.
 * After navigation we capture any session cookie the web app set, so the next
 * launch can restore it.
 */
export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      if (await isBiometricAvailable()) {
        // Gate the injection of the persisted session behind a biometric unlock.
        // On failure we still proceed but without restoring the session (web shows login).
        await authenticate("앱 잠금 해제").catch(() => false);
      }
      await injectStoredCookie();
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
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        onNavigationStateChange={() => {
          // Persist the session cookie the web app set (e.g. right after login).
          void captureCookieFromWebView();
        }}
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
