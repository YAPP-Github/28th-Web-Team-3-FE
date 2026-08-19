import type { OnboardingProfilePatch } from "@repo/schema/onboarding-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { SAVE_FAILED_TEXT } from "@/lib/messages";
import { patchOnboardingProfileOptions } from "@/lib/queries/onboarding";

/**
 * 질문 퍼널의 "다음" 저장 — mutation에 화면용 한국어 오류 문구를 얹는다.
 * 성공 여부를 boolean으로 돌려줘 호출부가 다음 단계로 넘어갈지 정한다.
 */
export function useSaveOnboardingProfile() {
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation(patchOnboardingProfileOptions(queryClient));
  // isPending은 다음 렌더에야 반영되므로, 같은 틱에 두 번 눌린 경우는 ref로 막는다.
  const savingRef = useRef(false);
  const [saveError, setSaveError] = useState<string>();
  /*
   * react-query의 isPending을 그대로 쓰면 저장 성공 직후 false로 돌아왔다가 router.push로
   * 다음 화면으로 넘어가기까지 한 프레임이 남아, 그 사이 "이전" 버튼이 비활성화→활성화로
   * 깜빡였다. 성공 시에는 리셋하지 않고 화면 전환에 맡긴다 — 실패했을 때만 다시 누를 수
   * 있게 되돌린다.
   */
  const [isSaving, setIsSaving] = useState(false);

  const saveProfile = useCallback(
    async (profile: OnboardingProfilePatch) => {
      if (savingRef.current) return false;

      savingRef.current = true;
      setSaveError(undefined);
      setIsSaving(true);

      try {
        await mutateAsync(profile);
        return true;
      } catch {
        setSaveError(SAVE_FAILED_TEXT);
        setIsSaving(false);
        return false;
      } finally {
        savingRef.current = false;
      }
    },
    [mutateAsync],
  );

  return { isSaving, saveError, saveProfile };
}
