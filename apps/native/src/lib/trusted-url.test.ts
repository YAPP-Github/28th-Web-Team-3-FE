import { describe, expect, it } from "vitest";
import { isAllowedExternalUrl, isTrustedWebViewUrl } from "./trusted-url";

const ORIGIN = "https://app.example.com";

describe("isTrustedWebViewUrl", () => {
  it("같은 origin이면 경로가 달라도 허용한다", () => {
    expect(isTrustedWebViewUrl("https://app.example.com/mission/new", ORIGIN)).toBe(true);
    expect(isTrustedWebViewUrl("https://app.example.com/?a=1#b", ORIGIN)).toBe(true);
  });

  it("접두사만 같은 다른 도메인을 거부한다", () => {
    // react-native-webview의 originWhitelist가 통과시키는 형태 — 이 함수가 막아야 한다.
    expect(isTrustedWebViewUrl("https://app.example.com.attacker.tld/x", ORIGIN)).toBe(false);
    expect(isTrustedWebViewUrl("https://app.example.com-evil.tld/", ORIGIN)).toBe(false);
  });

  it("서브도메인을 거부한다", () => {
    expect(isTrustedWebViewUrl("https://evil.app.example.com/", ORIGIN)).toBe(false);
  });

  it("포트가 다르면 거부한다", () => {
    expect(isTrustedWebViewUrl("https://app.example.com:8443/", ORIGIN)).toBe(false);
  });

  it("스킴이 다르면 거부한다", () => {
    expect(isTrustedWebViewUrl("http://app.example.com/", ORIGIN)).toBe(false);
  });

  it("URL로 파싱되지 않으면 거부한다", () => {
    expect(isTrustedWebViewUrl("not a url", ORIGIN)).toBe(false);
    expect(isTrustedWebViewUrl("", ORIGIN)).toBe(false);
  });

  it("about:blank은 허용한다", () => {
    // WebView가 초기화 중 스스로 로드하는 값이라 막으면 첫 렌더가 깨진다.
    expect(isTrustedWebViewUrl("about:blank", ORIGIN)).toBe(true);
  });

  it("localhost 개발 origin도 같은 규칙을 따른다", () => {
    const dev = "http://localhost:3000";
    expect(isTrustedWebViewUrl("http://localhost:3000/onboarding", dev)).toBe(true);
    expect(isTrustedWebViewUrl("http://localhost:3001/", dev)).toBe(false);
    expect(isTrustedWebViewUrl("http://localhost.attacker.tld/", dev)).toBe(false);
  });
});

describe("isAllowedExternalUrl", () => {
  it("브라우저·메일·전화 스킴을 허용한다", () => {
    expect(isAllowedExternalUrl("https://open.kakao.com/o/abc")).toBe(true);
    expect(isAllowedExternalUrl("http://example.com/")).toBe(true);
    expect(isAllowedExternalUrl("mailto:help@example.com")).toBe(true);
    expect(isAllowedExternalUrl("tel:021234567")).toBe(true);
  });

  it("스킴 대소문자를 가리지 않는다", () => {
    expect(isAllowedExternalUrl("HTTPS://example.com/")).toBe(true);
    expect(isAllowedExternalUrl("MailTo:help@example.com")).toBe(true);
  });

  it("네이티브 동작을 유발하는 스킴을 거부한다", () => {
    expect(isAllowedExternalUrl("intent://scan/#Intent;scheme=zxing;end")).toBe(false);
    expect(isAllowedExternalUrl("file:///etc/passwd")).toBe(false);
    expect(isAllowedExternalUrl("javascript:alert(1)")).toBe(false);
    expect(isAllowedExternalUrl("kakaotalk://main")).toBe(false);
    expect(isAllowedExternalUrl("data:text/html,<script>x</script>")).toBe(false);
  });

  it("스킴 앞에 공백·개행을 붙인 우회를 거부한다", () => {
    // WebView는 파싱 전에 이런 문자를 떼어내므로, 앵커만 믿고 통과시키면 안 된다.
    expect(isAllowedExternalUrl("\njavascript:alert(1)")).toBe(false);
    expect(isAllowedExternalUrl(" https://example.com/")).toBe(false);
  });

  it("스킴이 없으면 거부한다", () => {
    expect(isAllowedExternalUrl("//example.com/")).toBe(false);
    expect(isAllowedExternalUrl("/mission/new")).toBe(false);
    expect(isAllowedExternalUrl("")).toBe(false);
  });
});
