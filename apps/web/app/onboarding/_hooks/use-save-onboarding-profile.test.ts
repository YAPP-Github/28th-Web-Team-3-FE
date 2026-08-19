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

  /**
   * 저장 성공 직후 isSaving이 false로 돌아오면, 호출부가 router.push로 다음 화면에
   * 넘어가기까지 한 프레임 동안 "이전" 버튼이 비활성화→활성화로 깜빡였다(ButtonGroup의
   * `disabled={nextPending}`). 성공했을 때는 리셋하지 않고 화면 전환에 맡긴다.
   */
  it("저장에 성공하면 isSaving을 리셋하지 않고 true로 유지한다", async () => {
    vi.mocked(patchOnboardingProfile).mockResolvedValue({
      status: "IN_PROGRESS",
      birthDate: null,
      address: null,
      monthlySalaryManwon: 300,
      monthlySavingManwon: null,
      netWorthManwon: null,
      goalPeriodMonths: null,
    });
    const { result } = renderHook(() => useSaveOnboardingProfile());

    let saved: boolean | undefined;
    await act(async () => {
      saved = await result.current.saveProfile({ monthlySalaryManwon: 300 });
    });

    expect(saved).toBe(true);
    expect(result.current.isSaving).toBe(true);
  });
});
