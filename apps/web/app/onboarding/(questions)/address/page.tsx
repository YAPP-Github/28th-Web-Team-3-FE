"use client";

import type { OnboardingFormValues } from "@repo/schema/onboarding";
import type { ResidentialArea } from "@repo/schema/onboarding-api";
import { ButtonGroup, OptionGroup, OptionItem } from "@repo/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useSaveOnboardingProfile } from "@/app/onboarding/_hooks/use-save-onboarding-profile";
import { RESIDENTIAL_AREA_OPTIONS } from "@/app/onboarding/constants/residential-areas";
import { onboardingProfileOptions } from "@/lib/queries/onboarding";

export default function AddressOnboardingPage() {
  const router = useRouter();
  const { control, setValue, trigger } = useFormContext<OnboardingFormValues>();
  const address = useWatch({ control, name: "address" });
  const { data: profile } = useQuery(onboardingProfileOptions());
  const [hasAnswered, setHasAnswered] = useState(false);
  // BE는 신규 프로필에도 임시 기본값 SEOUL을 내려준다. 후속 답변이 없으면 저장된
  // 서울이 아니라 미응답으로 보고, 사용자가 지역을 명시적으로 선택하게 한다.
  const hasStoredAnswer =
    profile?.address != null &&
    (profile.address !== "SEOUL" ||
      profile.monthlySalaryManwon !== null ||
      profile.monthlySavingManwon !== null ||
      profile.netWorthManwon !== null ||
      profile.goalPeriodMonths !== null);
  const hasConfirmedAddress = hasAnswered || hasStoredAnswer;
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
            value={hasConfirmedAddress ? address : ""}
            onValueChange={(value) => {
              setHasAnswered(true);
              setValue("address", value as ResidentialArea, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              });
            }}
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
        <ButtonGroup
          nextDisabled={!hasConfirmedAddress || address === ""}
          nextPending={isSaving}
          onPrev={() => router.replace("/onboarding/age")}
          onNext={async () => {
            if (address !== "" && (await trigger("address", { shouldFocus: true }))) {
              if (await saveProfile({ address })) router.push("/onboarding/month");
            }
          }}
        />
      </div>
    </div>
  );
}
