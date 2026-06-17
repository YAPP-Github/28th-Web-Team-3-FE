import * as SecureStore from "expo-secure-store";

/**
 * The session cookie is the source of truth for "is the user logged in across
 * relaunches". We persist it encrypted in the device keychain/keystore, NOT in
 * the WebView's cookie store (which iOS WKWebView doesn't reliably keep).
 */
const SESSION_COOKIE_KEY = "session_cookie";

export async function saveSessionCookie(cookie: string): Promise<void> {
  await SecureStore.setItemAsync(SESSION_COOKIE_KEY, cookie, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });
}

export async function loadSessionCookie(): Promise<string | null> {
  return SecureStore.getItemAsync(SESSION_COOKIE_KEY);
}

export async function clearSessionCookie(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_COOKIE_KEY);
}
