import { bridge, isNativeApp } from "@repo/bridge";
import * as Sentry from "@sentry/nextjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { openExternalLink } from "./open-external";

vi.mock("@repo/bridge", () => ({
  bridge: { openExternal: vi.fn() },
  isNativeApp: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));

const URL_HTTPS = "https://example.com/policy";
const URL_MAILTO = "mailto:yappweb3@gmail.com";

/** jsdom은 `location`을 `configurable: true`로 두므로 통째로 갈아끼우고 원본을 되돌린다. */
const ORIGINAL_LOCATION = Object.getOwnPropertyDescriptor(window, "location");

function stubLocation() {
  const setHref = vi.fn();
  Object.defineProperty(window, "location", {
    configurable: true,
    value: {
      get href() {
        return "";
      },
      set href(value: string) {
        setHref(value);
      },
    },
  });
  return setHref;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(bridge.openExternal).mockResolvedValue(true);
  vi.mocked(isNativeApp).mockReturnValue(true);
});

afterEach(() => {
  vi.restoreAllMocks();
  if (ORIGINAL_LOCATION) Object.defineProperty(window, "location", ORIGINAL_LOCATION);
});

describe("네이티브 셸 안", () => {
  it("브릿지에 위임한다", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    openExternalLink(URL_HTTPS);

    expect(bridge.openExternal).toHaveBeenCalledWith(URL_HTTPS);
    expect(open).not.toHaveBeenCalled();
  });

  // 브릿지가 reject하는 경우 — 타임아웃이거나 구버전 셸에 메서드가 없다.
  it("브릿지가 실패하면 던지지 않고 보고한다", async () => {
    const error = new Error("bridge timeout");
    vi.mocked(bridge.openExternal).mockRejectedValue(error);

    expect(() => openExternalLink(URL_HTTPS)).not.toThrow();

    await vi.waitFor(() => expect(Sentry.captureException).toHaveBeenCalledOnce());
    expect(vi.mocked(Sentry.captureException).mock.calls[0]?.[0]).toBe(error);
  });

  // 브릿지는 닿았지만 OS가 못 연 경우 — 허용 안 되는 스킴이거나 처리할 앱이 없다.
  it("OS가 열지 못하면 보고한다", async () => {
    vi.mocked(bridge.openExternal).mockResolvedValue(false);

    openExternalLink(URL_HTTPS);

    await vi.waitFor(() => expect(Sentry.captureException).toHaveBeenCalledOnce());
  });

  it("열렸으면 보고하지 않는다", async () => {
    openExternalLink(URL_HTTPS);

    await vi.waitFor(() => expect(bridge.openExternal).toHaveBeenCalledOnce());
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });
});

describe("일반 브라우저", () => {
  beforeEach(() => {
    vi.mocked(isNativeApp).mockReturnValue(false);
  });

  it("새 탭으로 연다", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);

    openExternalLink(URL_HTTPS);

    expect(open).toHaveBeenCalledWith(URL_HTTPS, "_blank", "noopener,noreferrer");
    expect(bridge.openExternal).not.toHaveBeenCalled();
  });

  // 새 탭으로 열면 메일 앱이 뜬 뒤 빈 탭이 남는다.
  it("mailto는 현재 탭에서 넘긴다", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    const setHref = stubLocation();

    openExternalLink(URL_MAILTO);

    expect(setHref).toHaveBeenCalledWith(URL_MAILTO);
    expect(open).not.toHaveBeenCalled();
  });
});
