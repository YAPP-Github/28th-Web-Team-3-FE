import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@/lib/test/react";

const mocks = vi.hoisted(() => ({
  getPendingMissionGeneration: vi.fn(),
  isNativeApp: vi.fn(),
  push: vi.fn(),
}));

vi.mock("@repo/bridge", () => ({
  bridge: {
    clearPendingMissionGeneration: vi.fn(),
    getPendingMissionGeneration: mocks.getPendingMissionGeneration,
  },
  isNativeApp: mocks.isNativeApp,
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));

import { MissionAddMenu } from "./mission-add-menu";

describe("MissionAddMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isNativeApp.mockReturnValue(true);
  });

  it("진행 중인 추천 job이 있으면 채팅 화면을 거치지 않고 로딩으로 이동한다", async () => {
    mocks.getPendingMissionGeneration.mockResolvedValue({
      createdAt: Date.now(),
      expiresAt: null,
      jobId: "job-1",
    });
    render(<MissionAddMenu isOpen onToggle={vi.fn()} />);

    fireEvent.click(screen.getByRole("link", { name: "추천받기" }));

    await waitFor(() =>
      expect(mocks.push).toHaveBeenCalledWith("/mission/new/loading?jobId=job-1"),
    );
  });

  it("구 버전 네이티브 브릿지에서는 기존 채팅 화면으로 이동한다", async () => {
    mocks.getPendingMissionGeneration.mockRejectedValue(new Error("Method is not defined"));
    render(<MissionAddMenu isOpen onToggle={vi.fn()} />);

    fireEvent.click(screen.getByRole("link", { name: "추천받기" }));

    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/mission/new"));
  });
});
