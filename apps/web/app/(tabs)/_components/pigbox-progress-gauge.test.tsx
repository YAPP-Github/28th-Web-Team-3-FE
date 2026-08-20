import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, waitFor } from "@/lib/test/react";
import { calculatePigboxFillTop, PigboxProgressGauge } from "./pigbox-progress-gauge";

const lottieMocks = vi.hoisted(() => ({
  addEventListener: vi.fn(() => vi.fn()),
  destroy: vi.fn(),
  goToAndPlay: vi.fn(),
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
  const animationFrames: FrameRequestCallback[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    animationFrames.length = 0;
    lottieMocks.loadAnimation.mockReturnValue({
      addEventListener: lottieMocks.addEventListener,
      destroy: lottieMocks.destroy,
      goToAndPlay: lottieMocks.goToAndPlay,
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
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((callback: FrameRequestCallback) => {
        animationFrames.push(callback);
        return animationFrames.length;
      }),
    );
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

  it("첫 렌더에서는 현재 진행률을 애니메이션 없이 즉시 표시한다", async () => {
    const { container } = render(<PigboxProgressGauge completedCount={1} progress={10} />);
    const gauge = container.querySelector('[data-pigbox-progress="10"]');
    const fill = container.querySelector("[data-pigbox-fill]");

    await waitFor(() => expect(lottieMocks.loadAnimation).toHaveBeenCalledTimes(3));

    expect(gauge).toHaveAttribute("aria-hidden", "true");
    expect(gauge).not.toHaveAttribute("role");
    expect(gauge).toHaveStyle("--pigbox-fill-top: 87.9%");
    expect(fill).toHaveClass("transition-none");
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("기본값으로 저금통 자체를 반복 재생하지 않는다", async () => {
    render(<PigboxProgressGauge completedCount={1} progress={25} />);

    await waitFor(() => expect(lottieMocks.loadAnimation).toHaveBeenCalledTimes(3));

    expect(lottieMocks.play).not.toHaveBeenCalled();
    expect(lottieMocks.goToAndStop).toHaveBeenCalledTimes(3);
    expect(lottieMocks.loadAnimation.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ loop: false }),
    );
    expect(lottieMocks.addEventListener).toHaveBeenCalledWith("complete", expect.any(Function));
  });

  it("정지 모드에서 playRequest가 증가하면 정지 구간 다음부터 한 번 재생한다", async () => {
    const { rerender } = render(
      <PigboxProgressGauge animated={false} completedCount={1} playRequest={0} progress={25} />,
    );
    await waitFor(() => expect(lottieMocks.loadAnimation).toHaveBeenCalledTimes(3));

    rerender(
      <PigboxProgressGauge animated={false} completedCount={1} playRequest={1} progress={25} />,
    );

    expect(lottieMocks.goToAndPlay).toHaveBeenCalledOnce();
    expect(lottieMocks.goToAndPlay).toHaveBeenCalledWith(60, true);
  });

  it("움직임 줄이기 설정에서는 playRequest가 증가해도 재생하지 않는다", async () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    const { rerender } = render(
      <PigboxProgressGauge animated={false} completedCount={1} playRequest={0} progress={25} />,
    );
    await waitFor(() => expect(lottieMocks.loadAnimation).toHaveBeenCalledTimes(3));

    rerender(
      <PigboxProgressGauge animated={false} completedCount={1} playRequest={1} progress={25} />,
    );

    expect(lottieMocks.goToAndPlay).not.toHaveBeenCalled();
  });

  it("완료 개수가 그대로면 진행률 변경을 애니메이션 없이 즉시 표시한다", async () => {
    const { container, rerender } = render(
      <PigboxProgressGauge completedCount={1} progress={10} />,
    );
    await waitFor(() => expect(lottieMocks.loadAnimation).toHaveBeenCalledTimes(3));

    rerender(<PigboxProgressGauge completedCount={1} progress={20} />);

    expect(container.querySelector('[data-pigbox-progress="20"]')).toHaveStyle(
      "--pigbox-fill-top: 81.8%",
    );
    expect(container.querySelector("[data-pigbox-fill]")).toHaveClass("transition-none");
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("미션 완료 개수가 증가할 때만 이전 진행률에서 새 진행률까지 채운다", async () => {
    const { container, rerender } = render(
      <PigboxProgressGauge completedCount={1} progress={10} />,
    );
    await waitFor(() => expect(lottieMocks.loadAnimation).toHaveBeenCalledTimes(3));

    rerender(<PigboxProgressGauge completedCount={2} progress={20} />);

    const gauge = container.querySelector('[data-pigbox-progress="20"]');
    expect(gauge).toHaveStyle("--pigbox-fill-top: 87.9%");
    expect(container.querySelector("[data-pigbox-fill]")).toHaveClass("transition-[clip-path]");
    expect(animationFrames).toHaveLength(1);

    act(() => animationFrames[0]?.(0));
    expect(gauge).toHaveStyle("--pigbox-fill-top: 81.8%");
  });
});
