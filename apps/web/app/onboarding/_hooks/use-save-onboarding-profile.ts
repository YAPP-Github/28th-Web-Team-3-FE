"use client";

import type { OnboardingProfilePatch } from "@repo/schema/onboarding-api";
import { useCallback, useRef, useState } from "react";
import { patchOnboardingProfile } from "@/lib/onboarding/api";

export function useSaveOnboardingProfile() {
  const savingRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  const saveProfile = useCallback(async (profile: OnboardingProfilePatch) => {
    if (savingRef.current) return false;

    savingRef.current = true;
    setIsSaving(true);
    setSaveError(undefined);

    try {
      await patchOnboardingProfile(profile);
      return true;
    } catch {
      setSaveError("저장하지 못했어요. 잠시 후 다시 시도해주세요.");
      return false;
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }, []);

  return { isSaving, saveError, saveProfile };
}
