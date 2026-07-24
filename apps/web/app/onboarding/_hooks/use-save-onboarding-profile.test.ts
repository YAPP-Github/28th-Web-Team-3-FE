import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { patchOnboardingProfile } from "@/lib/onboarding";
import { useSaveOnboardingProfile } from "./use-save-onboarding-profile";

vi.mock("@/lib/onboarding", () => ({ patchOnboardingProfile: vi.fn() }));

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
    expect(result.current.saveError).toBe("저장하지 못했어요. 잠시 후 다시 시도해주세요.");
    expect(result.current.isSaving).toBe(false);
  });
});
