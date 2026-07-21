import { Linking } from "react-native";

/**
 * Open a URL outside the WebView — hands off to the OS, which routes to the
 * matching app (kakaotalk://, mailto:, tel:) or the default browser.
 */
export async function openExternal(url: string): Promise<boolean> {
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
