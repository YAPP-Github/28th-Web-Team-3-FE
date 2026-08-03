/**
 * WebView가 로드해도 되는 URL인지 판정한다.
 *
 * react-native-webview의 `originWhitelist`에 맡기면 안 된다 — 내부적으로
 * `^${escaped}` 정규식만 쓰고 끝 앵커가 없어서, `https://app.example.com`을 등록하면
 * `https://app.example.com.attacker.tld`도 통과한다. 통과한 페이지에는
 * `getAccessToken`·`refreshAccessToken` 브릿지가 그대로 주입되므로 토큰이 샌다.
 */
export function isTrustedWebViewUrl(url: string, expectedOrigin: string): boolean {
  // WebView가 초기화 중 스스로 로드한다. 막으면 첫 렌더가 깨진다.
  if (url === "about:blank") return true;
  try {
    return new URL(url).origin === expectedOrigin;
  } catch {
    return false;
  }
}
