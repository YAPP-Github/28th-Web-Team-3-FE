import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@/lib/test/react";
import { calculatePigboxFillTop, PigboxProgressGauge } from "./pigbox-progress-gauge";

const lottieMocks = vi.hoisted(() => ({
  addEventListener: vi.fn(() => vi.fn()),
  destroy: vi.fn(),
  goToAndStop: vi.fn(),
  loadAnimation: vi.fn(),
  play: vi.fn(),
}));

vi.mock("lottie-web", () => ({
  default: {
    loadAnimation: lottieMocks.loadAnimation,
  },
}));

describe("PigboxProgressGauge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lottieMocks.loadAnimation.mockReturnValue({
      addEventListener: lottieMocks.addEventListener,
      destroy: lottieMocks.destroy,
      goToAndStop: lottieMocks.goToAndStop,
      play: lottieMocks.play,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ fr: 60, ip: 0, layers: [], op: 120 }),
      }),
    );
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: false }));
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("진행률에 따라 다리 끝부터 몸통 위까지 물 높이를 계산한다", () => {
    expect(calculatePigboxFillTop(0)).toBe(94);
    expect(calculatePigboxFillTop(10)).toBe(87.9);
    expect(calculatePigboxFillTop(100)).toBe(33);
  });

  it("범위를 벗어난 진행률을 0~100으로 제한한다", () => {
    expect(calculatePigboxFillTop(-10)).toBe(94);
    expect(calculatePigboxFillTop(130)).toBe(33);
  });

  it("장식 이미지로 숨기고 0%에서 현재 미션 진행률까지 물을 채운다", async () => {
    const { container } = render(<PigboxProgressGauge progress={10} />);
    const gauge = container.querySelector('[data-pigbox-progress="10"]');

    expect(gauge).toHaveAttribute("aria-hidden", "true");
    expect(gauge).not.toHaveAttribute("role");
    expect(gauge).toHaveStyle("--pigbox-fill-top: 94%");

    await waitFor(() => expect(gauge).toHaveStyle("--pigbox-fill-top: 87.9%"));
  });
});
