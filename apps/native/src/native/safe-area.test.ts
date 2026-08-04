import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_SAFE_AREA_COLORS,
  getSafeAreaColors,
  setColors,
  subscribeSafeAreaColors,
} from "./safe-area";

beforeEach(() => {
  setColors(DEFAULT_SAFE_AREA_COLORS.top, DEFAULT_SAFE_AREA_COLORS.bottom);
});

describe("setColors", () => {
  it("색을 바꾸고 구독자에게 알린다", () => {
    const listener = vi.fn();
    subscribeSafeAreaColors(listener);

    setColors("#e5f6fe", "#ffffff");

    expect(getSafeAreaColors()).toEqual({ top: "#e5f6fe", bottom: "#ffffff" });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("3자리 축약형도 받는다", () => {
    setColors("#fff", "#000");

    expect(getSafeAreaColors()).toEqual({ top: "#fff", bottom: "#000" });
  });

  // 웹이 넘긴 값이 그대로 RN backgroundColor에 들어간다. 형식이 어긋나면 화면이 깨지므로
  // 받아들이지 않고 직전 색을 유지한다.
  it("16진수 색이 아니면 무시하고 직전 색을 유지한다", () => {
    setColors("#e5f6fe", "#ffffff");
    const listener = vi.fn();
    subscribeSafeAreaColors(listener);

    for (const invalid of ["red", "rgb(0,0,0)", "#12345", "", "#ggghhh", "#ffffff; drop"]) {
      setColors(invalid, "#ffffff");
      setColors("#ffffff", invalid);
    }

    expect(getSafeAreaColors()).toEqual({ top: "#e5f6fe", bottom: "#ffffff" });
    expect(listener).not.toHaveBeenCalled();
  });

  // useSyncExternalStore는 스냅샷이 같은 참조로 돌아와야 리렌더를 멈춘다.
  it("같은 색이면 알리지 않고 스냅샷 참조도 그대로다", () => {
    setColors("#e5f6fe", "#ffffff");
    const snapshot = getSafeAreaColors();
    const listener = vi.fn();
    subscribeSafeAreaColors(listener);

    setColors("#e5f6fe", "#ffffff");

    expect(getSafeAreaColors()).toBe(snapshot);
    expect(listener).not.toHaveBeenCalled();
  });
});

describe("subscribeSafeAreaColors", () => {
  it("해제한 구독자에게는 알리지 않는다", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeSafeAreaColors(listener);

    unsubscribe();
    setColors("#e5f6fe", "#ffffff");

    expect(listener).not.toHaveBeenCalled();
  });
});
