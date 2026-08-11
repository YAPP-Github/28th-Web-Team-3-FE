import { bridge, isNativeApp } from "@repo/bridge";
import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppVersionRow } from "./app-version-row";

vi.mock("@repo/bridge", () => ({
  bridge: { getNativeInfo: vi.fn() },
  isNativeApp: vi.fn(),
}));

const getNativeInfo = vi.mocked(bridge.getNativeInfo);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(isNativeApp).mockReturnValue(true);
  getNativeInfo.mockResolvedValue({
    platform: "ios",
    appVersion: "1.2.0",
    biometricAvailable: true,
  });
});

describe("AppVersionRow", () => {
  it("네이티브가 알려준 앱 버전을 보여준다", async () => {
    render(<AppVersionRow />);

    expect(await screen.findByText("1.2.0")).toBeInTheDocument();
    expect(screen.getByText("버전 정보")).toBeInTheDocument();
  });

  // 일반 브라우저에는 물어볼 셸이 없다. 빈 행을 남기면 앱이 버전을 잃은 것처럼 보인다.
  it("네이티브 셸 밖에서는 행을 그리지 않는다", () => {
    vi.mocked(isNativeApp).mockReturnValue(false);
    render(<AppVersionRow />);

    expect(screen.queryByText("버전 정보")).not.toBeInTheDocument();
    expect(getNativeInfo).not.toHaveBeenCalled();
  });

  // 구버전 셸에는 이 메서드가 없어 reject된다 — 버전만 못 보여줄 뿐 화면은 그대로 떠야 한다.
  // rejection을 삼키지 않으면 여기서 unhandled rejection으로 테스트 실행이 깨진다.
  it("브릿지가 실패해도 행만 빠진다", async () => {
    getNativeInfo.mockRejectedValue(new Error("method not found"));
    render(<AppVersionRow />);

    await waitFor(() => expect(getNativeInfo).toHaveBeenCalled());
    // 거부 핸들러가 흐르도록 마이크로태스크를 한 번 비운다.
    await act(async () => {});
    expect(screen.queryByText("버전 정보")).not.toBeInTheDocument();
  });

  // 네이티브는 버전을 못 읽으면 "unknown"을 준다. 그대로 그리면 앱이 버전을 잃은 것처럼 보인다.
  it("네이티브가 unknown을 주면 행을 그리지 않는다", async () => {
    getNativeInfo.mockResolvedValue({
      platform: "ios",
      appVersion: "unknown",
      biometricAvailable: true,
    });
    render(<AppVersionRow />);

    await waitFor(() => expect(getNativeInfo).toHaveBeenCalled());
    await act(async () => {});
    expect(screen.queryByText("버전 정보")).not.toBeInTheDocument();
  });
});
