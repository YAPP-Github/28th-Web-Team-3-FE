import type { SharePayload } from "@repo/bridge/types";
import * as Sharing from "expo-sharing";
import { Share } from "react-native";

/**
 * 네이티브 공유 시트. 구현 완료. expo-sharing은 로컬 파일만 공유하므로, url/text
 * payload는 RN 내장 Share API(OS 시트를 띄운다)를 쓴다.
 */
export async function open(payload: SharePayload): Promise<boolean> {
  // RN의 ShareContent는 `message` 문자열이 필수(옵셔널 아님)다.
  const message = payload.message ?? payload.url ?? "";
  if (!message) return false;

  // RN Share가 url/text를 처리하고, 양쪽 플랫폼 모두 시스템 공유 시트를 띄운다.
  const result = await Share.share(
    { message, url: payload.url, title: payload.title },
    { dialogTitle: payload.title },
  );
  return result.action !== Share.dismissedAction;
}

/** 파일 공유가 따로 필요한 호출부를 위해 노출해둔다. */
export async function isAvailable(): Promise<boolean> {
  return Sharing.isAvailableAsync();
}
