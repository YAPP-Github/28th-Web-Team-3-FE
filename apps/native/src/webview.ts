import { createWebView } from "@webview-bridge/react-native";
import { appBridge } from "./bridge";

/**
 * 네이티브 브릿지를 WebView 컴포넌트에 묶는다. 웹 앱은 이 WebView를 거쳐
 * @webview-bridge로 `appBridge` 메서드를 호출한다.
 */
export const { WebView } = createWebView({
  bridge: appBridge,
  debug: __DEV__,
  fallback: (method) => {
    console.warn(`[bridge] no web handler for "${method}"`);
  },
});
