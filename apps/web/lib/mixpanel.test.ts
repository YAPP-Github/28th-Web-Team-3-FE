import { beforeEach, describe, expect, it, vi } from "vitest";

const init = vi.fn();
const track = vi.fn();

vi.mock("mixpanel-browser", () => ({
  default: { init, track },
}));

describe("mixpanel", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_MIXPANEL_TOKEN", "mixpanel-token");
  });

  it("토큰이 있으면 한 번 초기화하고 페이지뷰는 계속 전송한다", async () => {
    const { trackPageView } = await import("./mixpanel");

    trackPageView("/");
    trackPageView("/mission");

    expect(init).toHaveBeenCalledOnce();
    expect(init).toHaveBeenCalledWith(
      "mixpanel-token",
      expect.objectContaining({
        autocapture: false,
        ignore_dnt: false,
        record_mask_all_inputs: true,
        record_mask_all_text: true,
        record_sessions_percent: 100,
      }),
    );
    expect(track).toHaveBeenCalledTimes(2);
    expect(track).toHaveBeenNthCalledWith(1, "Page Viewed", { path: "/" });
    expect(track).toHaveBeenNthCalledWith(2, "Page Viewed", { path: "/mission" });
  });

  it("토큰이 없으면 초기화와 추적을 하지 않는다", async () => {
    vi.stubEnv("NEXT_PUBLIC_MIXPANEL_TOKEN", "");
    const { trackPageView } = await import("./mixpanel");

    trackPageView("/");

    expect(init).not.toHaveBeenCalled();
    expect(track).not.toHaveBeenCalled();
  });

  it("Replay 샘플링 비율을 환경변수로 조정한다", async () => {
    vi.stubEnv("NEXT_PUBLIC_MIXPANEL_REPLAY_SAMPLE_PERCENT", "25");
    const { trackPageView } = await import("./mixpanel");

    trackPageView("/");

    expect(init).toHaveBeenCalledWith(
      "mixpanel-token",
      expect.objectContaining({ record_sessions_percent: 25 }),
    );
  });

  it("Replay 샘플링 비율은 0~100으로 제한한다", async () => {
    vi.stubEnv("NEXT_PUBLIC_MIXPANEL_REPLAY_SAMPLE_PERCENT", "150");
    const { trackPageView } = await import("./mixpanel");

    trackPageView("/");

    expect(init).toHaveBeenCalledWith(
      "mixpanel-token",
      expect.objectContaining({ record_sessions_percent: 100 }),
    );
  });
});
