import { describe, expect, it } from "vitest";
import { getSafeAreaBandTokens } from "./safe-area-bands";

describe("getSafeAreaBandTokens", () => {
  it("상단 밴드가 그 화면 히어로 배경을 이어받는다", () => {
    expect(getSafeAreaBandTokens("/mission").top).toBe("--color-gray-50");
    expect(getSafeAreaBandTokens("/benefits").top).toBe("--color-blue-50");
  });

  it("하단 밴드는 바텀 네비 배경을 따른다", () => {
    expect(getSafeAreaBandTokens("/mission").bottom).toBe("--color-gray-0");
    expect(getSafeAreaBandTokens("/benefits").bottom).toBe("--color-gray-0");
  });

  it("등록하지 않은 경로는 양쪽 다 기본값이다", () => {
    for (const pathname of ["/", "/mypage", "/goal", "/onboarding/goal", "/mission/new"]) {
      expect(getSafeAreaBandTokens(pathname)).toEqual({
        top: "--color-gray-0",
        bottom: "--color-gray-0",
      });
    }
  });

  // 하위 경로는 히어로가 없는 다른 화면이다 — 접두사로 매칭하면 잘못된 색이 남는다.
  it("등록한 경로의 하위 경로까지 끌어가지 않는다", () => {
    expect(getSafeAreaBandTokens("/mission/new").top).toBe("--color-gray-0");
  });
});
