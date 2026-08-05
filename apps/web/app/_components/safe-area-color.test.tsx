import { bridge, isNativeApp } from "@repo/bridge";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@/lib/test/react";
import { SafeAreaColor } from "./safe-area-color";

const { mockPathname } = vi.hoisted(() => ({ mockPathname: vi.fn<() => string>() }));

vi.mock("next/navigation", () => ({ usePathname: mockPathname }));

vi.mock("@repo/bridge", () => ({
  bridge: { setSafeAreaColor: vi.fn() },
  isNativeApp: vi.fn(),
}));

const setSafeAreaColor = vi.mocked(bridge.setSafeAreaColor);

/** globals.css는 테스트에 로드되지 않는다 — 변수를 직접 심어 해석 경로만 본다. */
function defineTokens(tokens: Record<string, string>) {
  for (const [name, value] of Object.entries(tokens)) {
    document.documentElement.style.setProperty(name, value);
  }
}

beforeEach(() => {
  vi.clearAllMocks();
  document.documentElement.removeAttribute("style");
  setSafeAreaColor.mockResolvedValue(undefined);
  vi.mocked(isNativeApp).mockReturnValue(true);
  defineTokens({
    "--color-gray-0": "#ffffff",
    "--color-gray-50": "#f0f3f8",
    "--color-blue-50": "#e5f6fe",
  });
});

describe("SafeAreaColor", () => {
  it("경로에 맞는 밴드 색을 네이티브에 넘긴다", () => {
    mockPathname.mockReturnValue("/benefits");
    render(<SafeAreaColor />);

    expect(setSafeAreaColor).toHaveBeenCalledWith("#e5f6fe", "#ffffff");
  });

  it("등록하지 않은 경로는 양쪽 다 기본색이다", () => {
    mockPathname.mockReturnValue("/mypage");
    render(<SafeAreaColor />);

    expect(setSafeAreaColor).toHaveBeenCalledWith("#ffffff", "#ffffff");
  });

  // 네이티브 셸 밖에는 밴드 자체가 없다. 부르면 브릿지가 reject된다.
  it("일반 브라우저에서는 부르지 않는다", () => {
    vi.mocked(isNativeApp).mockReturnValue(false);
    mockPathname.mockReturnValue("/benefits");
    render(<SafeAreaColor />);

    expect(setSafeAreaColor).not.toHaveBeenCalled();
  });

  // Tailwind v4는 실제로 쓰인 theme 변수만 내보낸다. 건너뛰면 직전 화면 색이 밴드에 남는다.
  it("변수가 없으면 직전 색을 남기지 않고 기본색으로 떨어뜨린다", () => {
    document.documentElement.style.removeProperty("--color-blue-50");
    mockPathname.mockReturnValue("/benefits");
    render(<SafeAreaColor />);

    expect(setSafeAreaColor).toHaveBeenCalledWith("#ffffff", "#ffffff");
  });

  it("16진수가 아닌 토큰도 기본색으로 떨어뜨린다", () => {
    defineTokens({ "--color-blue-50": "rgb(0 0 0 / 40%)" });
    mockPathname.mockReturnValue("/benefits");
    render(<SafeAreaColor />);

    expect(setSafeAreaColor).toHaveBeenCalledWith("#ffffff", "#ffffff");
  });

  // 구버전 셸에는 이 메서드가 없어 reject된다. 삼키지 않으면 unhandled rejection이 된다.
  it("브릿지가 실패해도 던지지 않는다", async () => {
    setSafeAreaColor.mockRejectedValue(new Error("method not found"));
    mockPathname.mockReturnValue("/mission");

    expect(() => render(<SafeAreaColor />)).not.toThrow();
    await expect(setSafeAreaColor.mock.results[0]?.value).rejects.toThrow("method not found");
  });
});
