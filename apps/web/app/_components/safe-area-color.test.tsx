import { bridge, isNativeApp } from "@repo/bridge";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SAFE_AREA_HERO_ATTRIBUTE } from "@/lib/safe-area-bands";
import { act, render } from "@/lib/test/react";
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

/**
 * 히어로를 화면에 심는다. `bottom`이 0보다 크면 아직 화면 맨 위를 덮고 있는 상태다.
 * jsdom은 레이아웃을 계산하지 않으므로 `getBoundingClientRect`를 직접 준다.
 */
function placeHero(bottom: number) {
  const hero = document.createElement("section");
  hero.setAttribute(SAFE_AREA_HERO_ATTRIBUTE, "");
  hero.getBoundingClientRect = () => ({ bottom }) as DOMRect;
  document.body.appendChild(hero);
  return hero;
}

/** rAF를 즉시 실행으로 바꿔 스크롤 반영을 동기적으로 본다. */
function scroll() {
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  document.documentElement.removeAttribute("style");
  document.body.innerHTML = "";
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  setSafeAreaColor.mockResolvedValue(undefined);
  vi.mocked(isNativeApp).mockReturnValue(true);
  defineTokens({
    "--color-gray-0": "#ffffff",
    "--color-gray-50": "#f0f3f8",
    "--color-blue-50": "#e5f6fe",
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
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

  /**
   * 히어로는 sticky가 아니라 스크롤하면 화면 위로 사라진다. 그때도 밴드가 히어로 색이면
   * 아래는 흰 본문인데 위만 파란 띠가 남는다 — 없애려던 흰 띠가 색만 바뀌어 돌아온다.
   */
  it("히어로가 화면 위로 지나가면 기본색으로 되돌린다", () => {
    const hero = placeHero(300);
    mockPathname.mockReturnValue("/benefits");
    render(<SafeAreaColor />);
    expect(setSafeAreaColor).toHaveBeenLastCalledWith("#e5f6fe", "#ffffff");

    hero.getBoundingClientRect = () => ({ bottom: -10 }) as DOMRect;
    scroll();

    expect(setSafeAreaColor).toHaveBeenLastCalledWith("#ffffff", "#ffffff");
  });

  it("히어로가 다시 화면에 들어오면 히어로 색으로 돌아온다", () => {
    const hero = placeHero(-10);
    mockPathname.mockReturnValue("/benefits");
    render(<SafeAreaColor />);
    expect(setSafeAreaColor).toHaveBeenLastCalledWith("#ffffff", "#ffffff");

    hero.getBoundingClientRect = () => ({ bottom: 300 }) as DOMRect;
    scroll();

    expect(setSafeAreaColor).toHaveBeenLastCalledWith("#e5f6fe", "#ffffff");
  });

  // 미션 탭은 데이터를 받은 뒤 히어로를 그린다. 그 사이 기본색을 보내면 히어로 색으로
  // 맞춰 둔 로딩 화면 위에 흰 띠가 생긴다.
  it("히어로를 아직 못 찾았으면 히어로 색을 유지한다", () => {
    mockPathname.mockReturnValue("/mission");
    render(<SafeAreaColor />);

    expect(setSafeAreaColor).toHaveBeenLastCalledWith("#f0f3f8", "#ffffff");
  });

  it("스크롤해도 색이 그대로면 다시 부르지 않는다", () => {
    placeHero(300);
    mockPathname.mockReturnValue("/benefits");
    render(<SafeAreaColor />);
    expect(setSafeAreaColor).toHaveBeenCalledOnce();

    scroll();
    scroll();

    expect(setSafeAreaColor).toHaveBeenCalledOnce();
  });

  // 히어로가 없는 화면은 스크롤을 봐도 바뀔 게 없다 — 리스너를 달지 않는다.
  it("히어로 색과 기본색이 같으면 스크롤을 보지 않는다", () => {
    const addEventListener = vi.spyOn(window, "addEventListener");
    mockPathname.mockReturnValue("/mypage");
    render(<SafeAreaColor />);

    expect(addEventListener.mock.calls.some(([type]) => type === "scroll")).toBe(false);
  });

  // 구버전 셸에는 이 메서드가 없어 reject된다. 삼키지 않으면 unhandled rejection이 된다.
  it("브릿지가 실패해도 던지지 않는다", async () => {
    setSafeAreaColor.mockRejectedValue(new Error("method not found"));
    mockPathname.mockReturnValue("/mission");

    expect(() => render(<SafeAreaColor />)).not.toThrow();
    await expect(setSafeAreaColor.mock.results[0]?.value).rejects.toThrow("method not found");
  });
});
