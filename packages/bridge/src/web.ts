import { linkBridge } from "@webview-bridge/web";
import type { AppBridge } from "./types";

/**
 * 네이티브 브릿지를 웹 쪽에서 잡는 핸들. 웹 앱이 `bridge.share(...)` 등을 호출하면
 * apps/native에 등록된 네이티브 구현으로 프록시된다.
 *
 * 타입은 전부 공유 계약에서 온다 — 여기엔 네이티브 코드를 import하지 않는다.
 */
export const bridge = linkBridge<AppBridge>({
  // 토큰 재발급(refreshAccessToken)은 네이티브 쪽에서 네트워크를 타므로
  // 기본 2초로는 부족하다. 넉넉히 10초.
  timeout: 10_000,
  throwOnError: true,
  onReady: () => {
    // 브릿지 핸드셰이크 완료. 이제 네이티브 메서드를 호출할 수 있다.
  },
});

/**
 * 네이티브 WebView 셸 안에서 실행 중일 때만 true. 네이티브 전용 UI(공유 버튼, 생체인증
 * 잠금)를 게이팅해서 같은 웹 앱이 일반 브라우저에서도 자연스럽게 동작하게 한다.
 */
export function isNativeApp(): boolean {
  return typeof window !== "undefined" && "ReactNativeWebView" in window;
}
