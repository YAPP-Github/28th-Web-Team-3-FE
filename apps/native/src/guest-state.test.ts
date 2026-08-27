import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  clearGuestTokens: vi.fn(),
  clearMissionCreationHistory: vi.fn(),
  clearPendingMissionGeneration: vi.fn(),
}));

vi.mock("./auth/guest-auth", () => ({ clearGuestTokens: mocks.clearGuestTokens }));
vi.mock("./mission-generation/history", () => ({
  clearMissionCreationHistory: mocks.clearMissionCreationHistory,
}));
vi.mock("./mission-generation/pending-job", () => ({
  clearPendingMissionGeneration: mocks.clearPendingMissionGeneration,
}));

import { clearGuestState } from "./guest-state";

beforeEach(() => vi.clearAllMocks());

it("탈퇴 후 인증과 게스트 귀속 로컬 상태를 함께 삭제한다", async () => {
  await clearGuestState();

  expect(mocks.clearGuestTokens).toHaveBeenCalledOnce();
  expect(mocks.clearMissionCreationHistory).toHaveBeenCalledOnce();
  expect(mocks.clearPendingMissionGeneration).toHaveBeenCalledWith();
});
