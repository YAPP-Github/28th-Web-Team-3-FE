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

/** OS에 넘겨도 되는 스킴. 브라우저·메일·전화처럼 동작이 예측 가능한 것만 둔다. */
const ALLOWED_EXTERNAL_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:"]);

/**
 * 신뢰 origin이 아닌 URL을 OS(`Linking`)에 넘겨도 되는지 판정한다.
 *
 * 임의 스킴을 그대로 넘기면 웹이 고른 문자열이 네이티브 동작이 된다 — `intent://`는
 * 안드로이드에서 다른 앱의 컴포넌트를 지정해 띄울 수 있고, `file://`는 로컬 파일을
 * 연다. 신뢰 origin에서 XSS가 한 번만 나도 이 경로가 열리므로 허용 목록으로 막는다.
 *
 * URL 전체를 파싱하지 않고 스킴만 본다 — RN의 URL 폴리필은 잘못된 입력에 throw하지
 * 않고 Node는 throw해서, 같은 코드가 런타임마다 다르게 동작한다.
 */
export function isAllowedExternalUrl(url: string): boolean {
  const scheme = /^[a-z][a-z0-9+.-]*:/i.exec(url)?.[0].toLowerCase();
  return scheme !== undefined && ALLOWED_EXTERNAL_SCHEMES.has(scheme);
}
