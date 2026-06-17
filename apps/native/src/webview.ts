import { createWebView } from "@webview-bridge/react-native";
import { appBridge } from "./bridge";

/**
 * Binds the native bridge to a WebView component. The web app talks to `appBridge`
 * methods through this WebView via @webview-bridge.
 */
export const { WebView, linkWebMethod } = createWebView({
  bridge: appBridge,
  debug: __DEV__,
  fallback: (method) => {
    console.warn(`[bridge] no web handler for "${method}"`);
  },
});
