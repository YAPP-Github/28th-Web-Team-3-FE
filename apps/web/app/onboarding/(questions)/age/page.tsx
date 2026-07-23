"use client";

import type { OnboardingFormValues } from "@repo/schema";
import { Button, Toggle } from "@repo/ui";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { AGE_GROUP_OPTIONS } from "@/app/onboarding/constants/questions";

export default function AgeOnboardingPage() {
  const router = useRouter();
  const { control, trigger } = useFormContext<OnboardingFormValues>();
  const selectedAgeGroup = useWatch({ control, name: "ageGroup" });

  useEffect(() => {
    router.prefetch("/onboarding/month");
  }, [router]);

  return (
    <div className="flex min-h-[calc(100dvh-56px)] flex-col px-5 pt-8">
      <section>
        <h1 className="text-headline-h2-700 text-black">나이가 어떻게 되시나요?</h1>
        <p className="mt-1 text-body-b1-400 text-gray-700">
          연령대에 맞는 정보를 드리기 위해 필요해요.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3">
          <Controller
            control={control}
            name="ageGroup"
            render={({ field }) => (
              <>
                {AGE_GROUP_OPTIONS.map((ageGroupOption) => (
                  <Toggle
                    key={ageGroupOption.value}
                    pressed={field.value === ageGroupOption.value}
                    variant="onboarding"
                    onPressedChange={(pressed) =>
                      field.onChange(pressed ? ageGroupOption.value : "")
                    }
                  >
                    {ageGroupOption.label}
                  </Toggle>
                ))}
              </>
            )}
          />
        </div>
      </section>
      <Button
        className="mt-auto mb-6 disabled:bg-gray-50 disabled:text-gray-300 disabled:opacity-100"
        disabled={selectedAgeGroup === ""}
        size="cta"
        onClick={async () => {
          if (await trigger("ageGroup", { shouldFocus: true })) {
            router.push("/onboarding/month");
          }
        }}
      >
        다음
      </Button>
    </div>
  );
}
