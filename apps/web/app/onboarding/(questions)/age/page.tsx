"use client";

import type { OnboardingFormValues } from "@repo/schema";
import { Button, Toggle } from "@repo/ui";
import { useRouter } from "next/navigation";
import { Controller, useFormContext } from "react-hook-form";

const AGE_OPTIONS = [
  { label: "10대", value: "teens" },
  { label: "20대", value: "twenties" },
  { label: "30대", value: "thirties" },
  { label: "40대", value: "forties" },
  { label: "50대", value: "fifties" },
  { label: "60대 이상", value: "sixties-or-older" },
] as const;

export default function AgeOnboardingPage() {
  const router = useRouter();
  const { control, trigger, watch } = useFormContext<OnboardingFormValues>();
  const ageGroup = watch("ageGroup");

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
                {AGE_OPTIONS.map((age) => (
                  <Toggle
                    key={age.value}
                    pressed={field.value === age.value}
                    variant="onboarding"
                    onPressedChange={(pressed) => field.onChange(pressed ? age.value : "")}
                  >
                    {age.label}
                  </Toggle>
                ))}
              </>
            )}
          />
        </div>
      </section>
      <Button
        className="mt-auto mb-6 disabled:bg-gray-50 disabled:text-gray-300 disabled:opacity-100"
        disabled={ageGroup === ""}
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
