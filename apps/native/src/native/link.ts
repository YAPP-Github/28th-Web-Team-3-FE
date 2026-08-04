import { Linking } from "react-native";
import { isAllowedExternalUrl } from "../lib/trusted-url";

/**
 * WebView 밖에서 URL을 연다 — OS에 넘기면 맞는 앱(mailto:, tel:)이나 기본 브라우저로
 * 알아서 라우팅된다.
 *
 * 웹에 열려 있는 브릿지 메서드라 URL을 그대로 믿지 않는다. 신뢰 origin에서 XSS가 한 번
 * 나면 `intent://`나 임의 딥링크를 네이티브에서 실행시키는 통로가 되기 때문이다.
 */
export async function openExternal(url: string): Promise<boolean> {
  if (!isAllowedExternalUrl(url)) return false;
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
