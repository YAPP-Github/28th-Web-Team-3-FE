"use client";

import type { OnboardingFormValues } from "@repo/schema/onboarding";
import type { ResidentialArea } from "@repo/schema/onboarding-api";
import { Button, OptionGroup, OptionItem } from "@repo/ui";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useSaveOnboardingProfile } from "@/app/onboarding/_hooks/use-save-onboarding-profile";
import { RESIDENTIAL_AREA_OPTIONS } from "@/app/onboarding/constants/residential-areas";

export default function AddressOnboardingPage() {
  const router = useRouter();
  const { control, setValue, trigger } = useFormContext<OnboardingFormValues>();
  const address = useWatch({ control, name: "address" });
  const { isSaving, saveError, saveProfile } = useSaveOnboardingProfile();

  useEffect(() => {
    router.prefetch("/onboarding/month");
  }, [router]);

  return (
    <div className="min-h-[calc(100dvh-56px)]">
      <section className="px-5 pt-8 pb-[138px]">
        <h1 className="text-pretty text-headline-h2-700 text-black">거주지역이 어디이신가요?</h1>
        <p className="mt-1 text-body-b1-400 text-gray-700">지역에 맞는 정보를 드려요</p>

        <div className="mt-12 flex flex-col gap-2">
          <p id="residential-area-label" className="text-body-b2-500 text-gray-700">
            거주 지역
          </p>
          <OptionGroup
            aria-labelledby="residential-area-label"
            className="grid grid-cols-2 gap-3"
            value={address}
            onValueChange={(value) =>
              setValue("address", value as ResidentialArea, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
          >
            {RESIDENTIAL_AREA_OPTIONS.map((option) => (
              <OptionItem className="border-gray-100" key={option.value} value={option.value}>
                {option.label}
              </OptionItem>
            ))}
          </OptionGroup>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-md bg-gray-0 px-5 pt-2 pb-6">
        {saveError ? (
          <p aria-live="polite" className="mb-3 text-center text-body-b2-500 text-error">
            {saveError}
          </p>
        ) : null}
        <Button
          className="disabled:bg-gray-50 disabled:text-gray-300 disabled:opacity-100"
          disabled={address === ""}
          pending={isSaving}
          size="cta"
          onClick={async () => {
            if (address !== "" && (await trigger("address", { shouldFocus: true }))) {
              if (await saveProfile({ address })) router.push("/onboarding/month");
            }
          }}
        >
          다음
        </Button>
      </div>
    </div>
  );
}
