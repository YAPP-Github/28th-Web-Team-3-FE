"use client";

import type { OnboardingFormValues } from "@repo/schema";
import { Button } from "@repo/ui";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { patchOnboardingProfile } from "@/lib/onboarding-api";

function formatBirthDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8)].filter(Boolean).join(".");
}

function toBirthDate(value: string) {
  return /^\d{4}\.\d{2}\.\d{2}$/.test(value) ? value.replaceAll(".", "-") : value;
}

export default function AgeOnboardingPage() {
  const router = useRouter();
  const { control, trigger } = useFormContext<OnboardingFormValues>();
  const birthDate = useWatch({ control, name: "birthDate" });
  const isBirthDateValid = /^\d{4}-\d{2}-\d{2}$/.test(birthDate);

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
        <div className="mt-12 flex flex-col gap-2">
          <label className="text-body-b2-500 text-gray-700" htmlFor="birth-date">
            생년월일
          </label>
          <Controller
            control={control}
            name="birthDate"
            render={({ field }) => (
              <input
                {...field}
                id="birth-date"
                autoComplete="off"
                className="h-[52px] rounded-xl border border-gray-100 px-4 text-body-b1-500 text-gray-900 placeholder:text-gray-200 focus-visible:border-gray-800 focus-visible:ring-2 focus-visible:ring-gray-100 focus-visible:outline-none"
                inputMode="numeric"
                maxLength={10}
                name="birthDate"
                placeholder="YYYY.MM.DD"
                value={field.value.replaceAll("-", ".")}
                onChange={(event) =>
                  field.onChange(toBirthDate(formatBirthDateInput(event.target.value)))
                }
              />
            )}
          />
        </div>
      </section>
      <Button
        className="mt-auto mb-6 disabled:bg-gray-50 disabled:text-gray-300 disabled:opacity-100"
        disabled={!isBirthDateValid}
        size="cta"
        onClick={async () => {
          if (await trigger("birthDate", { shouldFocus: true })) {
            await patchOnboardingProfile({ birthDate });
            router.push("/onboarding/month");
          }
        }}
      >
        다음
      </Button>
    </div>
  );
}
