import { linkBridge } from "@webview-bridge/web";
import type { AppBridge } from "./types";

/**
 * Web-side handle to the native bridge. The web app calls `bridge.share(...)` etc.
 * and the call is proxied to the native implementation registered in apps/native.
 *
 * Type comes entirely from the shared contract — no native code imported here.
 */
export const bridge = linkBridge<AppBridge>({
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
