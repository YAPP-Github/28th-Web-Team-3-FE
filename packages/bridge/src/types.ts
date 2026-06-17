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
  /** Push: get the device push token. STUB for now (returns null). */
  getPushToken(): Promise<string | null>;
  /** Push: request permission + register. STUB for now (returns false). */
  registerPush(): Promise<boolean>;
  /** Platform / capability probe for feature-gating in the web UI. */
  getNativeInfo(): Promise<NativeInfo>;
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
  sessionInvalidated: { reason: string };
};
