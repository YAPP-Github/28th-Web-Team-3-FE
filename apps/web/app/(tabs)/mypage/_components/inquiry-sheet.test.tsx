import { bridge, isNativeApp } from "@repo/bridge";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@/lib/test/react";
import { InquirySheet } from "./inquiry-sheet";

vi.mock("@repo/bridge", () => ({
  bridge: { openExternal: vi.fn() },
  isNativeApp: vi.fn(),
}));

const OPEN_CHAT_URL = "https://open.kakao.com/o/test";
const MAILTO = "mailto:yappweb3@gmail.com";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(bridge.openExternal).mockResolvedValue(true);
  vi.mocked(isNativeApp).mockReturnValue(true);
  // 셸에서 export한 값이 남아 있으면 폴백 분기를 못 탄다. 빈 문자열은 falsy라 없는 것과 같다.
  vi.stubEnv("NEXT_PUBLIC_KAKAO_OPENCHAT_URL", "");
});

/**
 * `window.location`을 갈아끼운 테스트가 원상복구할 수 있게 원본 서술자를 들고 있는다.
 * 복원하지 않으면 이후 테스트가 가짜 location을 물려받는다.
 *
 * jsdom이 `location`을 `configurable: true`로 두므로 재정의 자체는 된다. 반대로
 * `location.assign`은 `writable: false, configurable: false`라 `vi.spyOn`으로는 못 잡는다.
 */
const ORIGINAL_LOCATION = Object.getOwnPropertyDescriptor(window, "location");

afterEach(() => {
  vi.unstubAllEnvs();
  // clearAllMocks는 호출 기록만 비운다 — spyOn으로 갈아낀 원본은 여기서 돌려놔야 한다.
  vi.restoreAllMocks();
  if (ORIGINAL_LOCATION) Object.defineProperty(window, "location", ORIGINAL_LOCATION);
});

describe("InquirySheet", () => {
  it("오픈채팅 URL이 있으면 그쪽으로 연결한다", () => {
    vi.stubEnv("NEXT_PUBLIC_KAKAO_OPENCHAT_URL", OPEN_CHAT_URL);
    render(<InquirySheet open onOpenChange={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "카카오톡으로 문의하기" }));

    expect(bridge.openExternal).toHaveBeenCalledWith(OPEN_CHAT_URL);
  });

  // 버튼을 막으면 문의 수단이 아예 없는 앱이 된다. 심사에서는 그게 더 크게 걸린다.
  it("오픈채팅 URL이 없어도 이메일로 문의할 수 있다", () => {
    render(<InquirySheet open onOpenChange={() => {}} />);

    const button = screen.getByRole("button", { name: "이메일로 문의하기" });
    expect(button).toBeEnabled();

    fireEvent.click(button);

    expect(bridge.openExternal).toHaveBeenCalledWith(MAILTO);
  });

  /**
   * 배포 환경은 변수를 비운 채 정의해두거나 값을 잘못 넣기도 한다. 그런 값을 "설정됨"으로
   * 보면 이메일 주소를 감춘 채 눌러도 아무 일 없는(혹은 무관한 사이트를 여는) 버튼만 남는다.
   */
  it.each([
    " ",
    "https://",
    "잘못된 주소",
    "http://open.kakao.com/o/test",
    // 열리기는 하지만 "카카오톡으로 문의하기"라고 해놓고 무관한 사이트를 띄운다.
    "https://example.com",
    "https://open.kakao.com.attacker.tld/o/test",
  ])("오픈채팅으로 못 여는 값(%j)은 설정 안 한 것으로 본다", (value) => {
    vi.stubEnv("NEXT_PUBLIC_KAKAO_OPENCHAT_URL", value);
    render(<InquirySheet open onOpenChange={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "이메일로 문의하기" }));

    expect(bridge.openExternal).toHaveBeenCalledWith(MAILTO);
  });

  /**
   * `openExternal`은 실패해도 던지지 않고 false만 준다 — 앱이 없는 기기에서는 눌러도 무반응이다.
   * 어느 경로가 막히든 옮겨 적을 주소는 화면에 남아야 한다.
   */
  it.each([
    ["오픈채팅", OPEN_CHAT_URL],
    ["이메일", ""],
  ])("%s 링크가 안 열려도 주소가 화면에 남는다", (_label, envValue) => {
    vi.stubEnv("NEXT_PUBLIC_KAKAO_OPENCHAT_URL", envValue);
    vi.mocked(bridge.openExternal).mockResolvedValue(false);
    render(<InquirySheet open onOpenChange={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: /문의하기$/ }));

    expect(screen.getByText("yappweb3@gmail.com")).toBeInTheDocument();
  });

  // 일반 브라우저에서 mailto를 새 탭으로 열면 빈 탭이 남는다.
  it("브라우저에서는 현재 탭으로 메일 앱에 넘긴다", () => {
    vi.mocked(isNativeApp).mockReturnValue(false);
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    const setHref = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        get href() {
          return "";
        },
        set href(value: string) {
          setHref(value);
        },
      },
    });

    render(<InquirySheet open onOpenChange={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "이메일로 문의하기" }));

    expect(setHref).toHaveBeenCalledWith(MAILTO);
    expect(open).not.toHaveBeenCalled();
    expect(bridge.openExternal).not.toHaveBeenCalled();
  });
});
