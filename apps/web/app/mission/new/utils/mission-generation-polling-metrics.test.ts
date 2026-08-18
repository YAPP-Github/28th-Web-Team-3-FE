import { afterEach, describe, expect, it, vi } from "vitest";
import { recordMissionGenerationPollMetric } from "./mission-generation-polling-metrics";

afterEach(() => vi.unstubAllGlobals());

describe("recordMissionGenerationPollMetric", () => {
  it("duration과 시작 시점을 함께 기록한다", () => {
    const measure = vi.fn();
    vi.stubGlobal("performance", { measure, now: () => 100 });

    recordMissionGenerationPollMetric({ durationMs: 24, source: "service-worker" });

    expect(measure).toHaveBeenCalledWith("mission-generation-poll:service-worker", {
      duration: 24,
      start: 76,
    });
  });

  it("성능 측정이 실패해도 호출부를 깨뜨리지 않는다", () => {
    vi.stubGlobal("performance", {
      measure: vi.fn(() => {
        throw new TypeError("unsupported");
      }),
      now: () => 100,
    });

    expect(() =>
      recordMissionGenerationPollMetric({ durationMs: 24, source: "page" }),
    ).not.toThrow();
  });
});
