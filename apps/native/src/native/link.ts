import { Linking } from "react-native";

/**
 * WebView 밖에서 URL을 연다 — OS에 넘기면 맞는 앱(kakaotalk://, mailto:, tel:)이나
 * 기본 브라우저로 알아서 라우팅된다.
 */
export async function openExternal(url: string): Promise<boolean> {
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
