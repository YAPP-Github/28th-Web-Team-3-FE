import { bridge, isNativeApp } from "@repo/bridge";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@/lib/test/react";
import { InquirySheet } from "./inquiry-sheet";

vi.mock("@repo/bridge", () => ({
  bridge: { openExternal: vi.fn() },
  isNativeApp: vi.fn(),
}));

const OPEN_CHAT_URL = "https://open.kakao.com/o/test";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(bridge.openExternal).mockResolvedValue(true);
  vi.mocked(isNativeApp).mockReturnValue(true);
  // 대입으로 지우면 문자열 "undefined"가 남아 truthy가 된다. .env.local 값도 여기서 걷힌다.
  delete process.env.NEXT_PUBLIC_KAKAO_OPENCHAT_URL;
});

describe("InquirySheet", () => {
  it("오픈채팅 URL이 있으면 그쪽으로 연결한다", () => {
    process.env.NEXT_PUBLIC_KAKAO_OPENCHAT_URL = OPEN_CHAT_URL;
    render(<InquirySheet open onOpenChange={() => {}} />);

    screen.getByRole("button", { name: "카카오톡으로 문의하기" }).click();

    expect(bridge.openExternal).toHaveBeenCalledWith(OPEN_CHAT_URL);
  });

  // 버튼을 막으면 문의 수단이 아예 없는 앱이 된다. 심사에서는 그게 더 크게 걸린다.
  it("오픈채팅 URL이 없어도 이메일로 문의할 수 있다", () => {
    render(<InquirySheet open onOpenChange={() => {}} />);

    const button = screen.getByRole("button", { name: "이메일로 문의하기" });
    expect(button).toBeEnabled();

    button.click();

    expect(bridge.openExternal).toHaveBeenCalledWith("mailto:yappweb3@gmail.com");
  });
});
