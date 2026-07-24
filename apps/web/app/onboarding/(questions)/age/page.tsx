"use client";

import type { OnboardingFormValues } from "@repo/schema";
import { Button } from "@repo/ui";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useSaveOnboardingProfile } from "@/app/onboarding/_hooks/use-save-onboarding-profile";

function formatBirthDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8)].filter(Boolean).join(".");
}

function toBirthDate(value: string) {
  return /^\d{4}\.\d{2}\.\d{2}$/.test(value) ? value.replaceAll(".", "-") : value;
}

function isRealBirthDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const parts = value.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

export default function AgeOnboardingPage() {
  const router = useRouter();
  const { control, trigger } = useFormContext<OnboardingFormValues>();
  const birthDate = useWatch({ control, name: "birthDate" });
  const hasBirthDateFormat = /^\d{4}-\d{2}-\d{2}$/.test(birthDate);
  const isBirthDateValid = isRealBirthDate(birthDate);
  const birthDateError =
    hasBirthDateFormat && !isBirthDateValid ? "올바른 날짜를 입력해주세요." : undefined;
  const { isSaving, saveError, saveProfile } = useSaveOnboardingProfile();

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
                aria-describedby={birthDateError ? "birth-date-error" : undefined}
                aria-invalid={birthDateError ? true : undefined}
                autoComplete="off"
                className={`h-[52px] rounded-xl border px-4 text-body-b1-500 text-gray-900 placeholder:text-gray-200 focus-visible:ring-2 focus-visible:outline-none ${birthDateError ? "border-error focus-visible:border-error focus-visible:ring-error-light" : "border-gray-100 focus-visible:border-gray-800 focus-visible:ring-gray-100"}`}
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
          {birthDateError ? (
            <p id="birth-date-error" aria-live="polite" className="text-body-b2-500 text-error">
              {birthDateError}
            </p>
          ) : null}
        </div>
      </section>
      {saveError ? (
        <p aria-live="polite" className="mt-auto text-center text-body-b2-500 text-gray-700">
          {saveError}
        </p>
      ) : null}
      <Button
        className={`${saveError ? "mt-3" : "mt-auto"} mb-6 disabled:bg-gray-50 disabled:text-gray-300 disabled:opacity-100`}
        disabled={!isBirthDateValid || isSaving}
        size="cta"
        onClick={async () => {
          if (await trigger("birthDate", { shouldFocus: true })) {
            if (await saveProfile({ birthDate })) router.push("/onboarding/month");
          }
        }}
      >
        {isSaving ? "저장 중…" : "다음"}
      </Button>
    </div>
  );
}
