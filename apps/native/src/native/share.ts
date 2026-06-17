import type { SharePayload } from "@repo/bridge/types";
import * as Sharing from "expo-sharing";
import { Share } from "react-native";

/**
 * Native share sheet. Implemented. expo-sharing only shares local files, so for
 * url/text payloads we use RN's built-in Share API (which presents the OS sheet).
 */
export async function open(payload: SharePayload): Promise<boolean> {
  // RN's ShareContent requires a non-optional `message` string.
  const message = payload.message ?? payload.url ?? "";
  if (!message) return false;

  // RN Share handles url/text and shows the system share sheet on both platforms.
  const result = await Share.share(
    { message, url: payload.url, title: payload.title },
    { dialogTitle: payload.title },
  );
  return result.action !== Share.dismissedAction;
}

/** Exposed for callers that specifically need file sharing. */
export async function isAvailable(): Promise<boolean> {
  return Sharing.isAvailableAsync();
}
