import { linkBridge } from "@webview-bridge/web";
import type { AppBridge } from "./types";

/**
 * Web-side handle to the native bridge. The web app calls `bridge.share(...)` etc.
 * and the call is proxied to the native implementation registered in apps/native.
 *
 * Type comes entirely from the shared contract — no native code imported here.
 */
export const bridge = linkBridge<AppBridge>({
  // 토큰 재발급(refreshAccessToken)은 네이티브 쪽에서 네트워크를 타므로
  // 기본 2초로는 부족하다. 넉넉히 10초.
  timeout: 10_000,
  throwOnError: true,
  onReady: () => {
    // Bridge handshake complete; native methods are now callable.
  },
});

/**
 * True only when running inside the native WebView shell. Use this to feature-gate
 * native-only UI (share button, biometric lock) so the same web app degrades
 * gracefully in a plain browser.
 */
export function isNativeApp(): boolean {
  return typeof window !== "undefined" && "ReactNativeWebView" in window;
}
