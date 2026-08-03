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

    await trackPageView("/");
    await trackPageView("/mission");

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

  // 초기 번들에서 빼면서 로드가 비동기가 됐다. 로드가 끝나기 전에 쌓인 이벤트가
  // 사라지거나 순서가 뒤집히면, 번들을 줄인 대가로 지표를 잃는다.
  it("로드가 끝나기 전에 겹쳐 호출해도 순서대로 모두 전송한다", async () => {
    const { trackPageView } = await import("./mixpanel");

    const inFlight = [trackPageView("/"), trackPageView("/mission"), trackPageView("/goal")];
    // 아직 로드 전이라 아무것도 나가지 않았다.
    expect(track).not.toHaveBeenCalled();
    await Promise.all(inFlight);

    expect(init).toHaveBeenCalledOnce();
    expect(track).toHaveBeenCalledTimes(3);
    expect(track).toHaveBeenNthCalledWith(1, "Page Viewed", { path: "/" });
    expect(track).toHaveBeenNthCalledWith(2, "Page Viewed", { path: "/mission" });
    expect(track).toHaveBeenNthCalledWith(3, "Page Viewed", { path: "/goal" });
  });

  // 호출부가 `void`로 흘려보내므로 여기서 새면 unhandled rejection이 된다.
  it("전송이 실패해도 예외를 밖으로 내보내지 않는다", async () => {
    track.mockImplementationOnce(() => {
      throw new Error("network error");
    });
    const { trackPageView } = await import("./mixpanel");

    await expect(trackPageView("/")).resolves.toBeUndefined();
  });

  it("토큰이 없으면 초기화와 추적을 하지 않는다", async () => {
    vi.stubEnv("NEXT_PUBLIC_MIXPANEL_TOKEN", "");
    const { trackPageView } = await import("./mixpanel");

    await trackPageView("/");

    expect(init).not.toHaveBeenCalled();
    expect(track).not.toHaveBeenCalled();
  });

  it("Replay 샘플링 비율을 환경변수로 조정한다", async () => {
    vi.stubEnv("NEXT_PUBLIC_MIXPANEL_REPLAY_SAMPLE_PERCENT", "25");
    const { trackPageView } = await import("./mixpanel");

    await trackPageView("/");

    expect(init).toHaveBeenCalledWith(
      "mixpanel-token",
      expect.objectContaining({ record_sessions_percent: 25 }),
    );
  });

  it("Replay 샘플링 비율은 0~100으로 제한한다", async () => {
    vi.stubEnv("NEXT_PUBLIC_MIXPANEL_REPLAY_SAMPLE_PERCENT", "150");
    const { trackPageView } = await import("./mixpanel");

    await trackPageView("/");

    expect(init).toHaveBeenCalledWith(
      "mixpanel-token",
      expect.objectContaining({ record_sessions_percent: 100 }),
    );
  });
});
