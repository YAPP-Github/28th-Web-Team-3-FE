import type { OnboardingProfilePatch } from "@repo/schema/onboarding-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { SAVE_FAILED_TEXT } from "@/lib/messages";
import { patchOnboardingProfileOptions } from "@/lib/onboarding/queries";

/**
 * 질문 퍼널의 "다음" 저장 — mutation에 화면용 한국어 오류 문구를 얹는다.
 * 성공 여부를 boolean으로 돌려줘 호출부가 다음 단계로 넘어갈지 정한다.
 */
export function useSaveOnboardingProfile() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation(patchOnboardingProfileOptions(queryClient));
  // isPending은 다음 렌더에야 반영되므로, 같은 틱에 두 번 눌린 경우는 ref로 막는다.
  const savingRef = useRef(false);
  const [saveError, setSaveError] = useState<string>();

  const saveProfile = useCallback(
    async (profile: OnboardingProfilePatch) => {
      if (savingRef.current) return false;

      savingRef.current = true;
      setSaveError(undefined);

      try {
        await mutateAsync(profile);
        return true;
      } catch {
        setSaveError(SAVE_FAILED_TEXT);
        return false;
      } finally {
        savingRef.current = false;
      }
    },
    [mutateAsync],
  );

  return { isSaving: isPending, saveError, saveProfile };
}
