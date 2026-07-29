import { beforeEach, describe, expect, it, vi } from "vitest";
import { patchOnboardingProfile } from "@/api/onboarding";
import { SAVE_FAILED_TEXT } from "@/lib/messages";
import { act, renderHook } from "@/lib/test/react";
import { useSaveOnboardingProfile } from "./use-save-onboarding-profile";

vi.mock("@/api/onboarding", () => ({ patchOnboardingProfile: vi.fn() }));

describe("useSaveOnboardingProfile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("저장 실패를 처리하고 재시도 메시지를 제공한다", async () => {
    vi.mocked(patchOnboardingProfile).mockRejectedValue(new Error("network error"));
    const { result } = renderHook(() => useSaveOnboardingProfile());

    let saved: boolean | undefined;
    await act(async () => {
      saved = await result.current.saveProfile({ monthlySalaryManwon: 300 });
    });

    expect(saved).toBe(false);
    expect(result.current.saveError).toBe(SAVE_FAILED_TEXT);
    expect(result.current.isSaving).toBe(false);
  });
});
