/**
 * THE BRIDGE CONTRACT — single source of truth, shared by web and native.
 *
 * This file has ZERO Expo / React Native imports, so both sides can depend on it:
 *  - native (apps/native) IMPLEMENTS this with `bridge({...}) satisfies AppBridge`
 *  - web (apps/web)       CONSUMES this via `linkBridge<AppBridge>()`
 *
 * Every method is async (calls are proxied across the WebView boundary).
 * Keep return types serializable (no class instances, Dates as ISO strings, etc.).
 */

export interface SharePayload {
  /** Plain text / message body. */
  message?: string;
  /** A URL to share (App Store 4.2: native share sheet). */
  url?: string;
  /** Optional dialog title (Android). */
  title?: string;
}

export interface NativeInfo {
  platform: "ios" | "android";
  appVersion: string;
  /** Whether biometric hardware is enrolled & available. */
  biometricAvailable: boolean;
}

import type { BridgeStore } from "@webview-bridge/types";

/**
 * The bridge METHODS. `type` (not `interface`) so it structurally satisfies
 * @webview-bridge's `Bridge` constraint (an index-signature record of async fns).
 * Native implements this; web calls it.
 */
export type AppBridgeMethods = {
  /** Biometric unlock (Face ID / fingerprint). Resolves true on success. */
  authenticate(reason?: string): Promise<boolean>;
  /** Open the OS native share sheet. Resolves true if the user completed/dismissed. */
  share(payload: SharePayload): Promise<boolean>;
  /**
   * Open a URL outside the WebView — the OS browser or the matching app (카카오톡 등).
   * WebView 안에서 `window.open`/`target="_blank"`는 통하지 않으므로 네이티브에 위임한다.
   * Resolves true if the OS accepted the open request.
   */
  openExternal(url: string): Promise<boolean>;
  /** Push: get the device push token. STUB for now (returns null). */
  getPushToken(): Promise<string | null>;
  /** Push: request permission + register. STUB for now (returns false). */
  registerPush(): Promise<boolean>;
  /** Platform / capability probe for feature-gating in the web UI. */
  getNativeInfo(): Promise<NativeInfo>;
  /**
   * Guest auth: RN 메모리에 있는 access token을 반환한다 (pull 모델).
   * 없으면 네이티브가 발급을 시도하고, 발급 실패(오프라인 등) 시 null.
   * refreshToken은 절대 이 경계를 넘지 않는다.
   */
  getAccessToken(): Promise<string | null>;
  /**
   * Guest auth: 웹이 401을 받았을 때 호출하는 재발급 요청.
   * 네이티브가 single-flight로 rotation을 수행하고 새 access token을 반환한다.
   * refresh token까지 만료된 경우 저장된 기기 uuid로 /api/auth/guest를 다시 호출해
   * 같은 게스트 계정으로 복귀한다. 그마저 실패하면 null (호출부는 에러 UI).
   */
  refreshAccessToken(): Promise<string | null>;
};

/**
 * Store-wrapped contract — what the native `bridge()` returns and what the web
 * `linkBridge<T>()` consumes. This is the type both sides share.
 */
export type AppBridge = BridgeStore<AppBridgeMethods>;

/**
 * Native -> web events (emitted via the bridge's postMessage channel).
 * Web subscribes; native publishes (e.g. when a push notification is tapped).
 */
export type BridgeEvents = {
  pushNotificationOpened: { data: Record<string, unknown> };
};
