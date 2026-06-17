/**
 * Push notifications — STUB.
 *
 * The bridge interface (`getPushToken` / `registerPush`) is defined in @repo/bridge
 * so the contract is locked in from day one. Implementation is intentionally deferred:
 * wiring expo-notifications needs an EAS project id, APNs/FCM credentials, and a
 * server-side token registration endpoint.
 *
 * To implement later:
 *   import * as Notifications from "expo-notifications";
 *   const { status } = await Notifications.requestPermissionsAsync();
 *   const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
 *   // POST token to the server (native -> server directly; do NOT expose to web).
 */

export async function getToken(): Promise<string | null> {
  return null;
}

export async function register(): Promise<boolean> {
  return false;
}
