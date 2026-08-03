import { describe, expect, it } from "vitest";
import { isTrustedWebViewUrl } from "./trusted-url";

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
