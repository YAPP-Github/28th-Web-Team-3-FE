"use client";

import type { OnboardingFormValues } from "@repo/schema/onboarding";
import { Button, Input } from "@repo/ui";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useSaveOnboardingProfile } from "@/app/onboarding/_hooks/use-save-onboarding-profile";
import { onlyDigits } from "@/lib/number";

function formatBirthDateInput(value: string) {
  const digits = onlyDigits(value).slice(0, 8);
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

/** 서버는 생년월일을 과거 날짜로만 받는다(오늘도 거부) — 보내기 전에 같은 기준으로 거른다. */
function isPastBirthDate(value: string) {
  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const parts = value.split("-");
  return Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])) < todayUtc;
}

export default function AgeOnboardingPage() {
  const router = useRouter();
  const { control, trigger } = useFormContext<OnboardingFormValues>();
  const birthDate = useWatch({ control, name: "birthDate" });
  const hasBirthDateFormat = /^\d{4}-\d{2}-\d{2}$/.test(birthDate);
  const isBirthDateValid = isRealBirthDate(birthDate) && isPastBirthDate(birthDate);
  const birthDateError = !hasBirthDateFormat
    ? undefined
    : !isRealBirthDate(birthDate)
      ? "올바른 날짜를 입력해주세요."
      : !isPastBirthDate(birthDate)
        ? "오늘 이전 날짜로 입력해주세요."
        : undefined;
  const { isSaving, saveError, saveProfile } = useSaveOnboardingProfile();
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    router.prefetch("/onboarding/address");
  }, [router]);

  async function submitBirthDate() {
    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;

    try {
      if (await trigger("birthDate", { shouldFocus: true })) {
        if (await saveProfile({ birthDate })) router.push("/onboarding/address");
      }
    } finally {
      isSubmittingRef.current = false;
    }
  }

  return (
    <form
      className="flex min-h-[calc(100dvh-56px-var(--keyboard-inset,0px))] flex-col px-5 pt-8"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void submitBirthDate();
      }}
    >
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
              <Input
                {...field}
                id="birth-date"
                aria-describedby={birthDateError ? "birth-date-error" : undefined}
                aria-invalid={birthDateError ? true : undefined}
                autoFocus
                autoComplete="off"
                enterKeyHint="done"
                inputMode="numeric"
                maxLength={10}
                name="birthDate"
                placeholder="YYYY.MM.DD"
                value={field.value.replaceAll("-", ".")}
                onChange={(event) =>
                  field.onChange(toBirthDate(formatBirthDateInput(event.target.value)))
                }
                onKeyDown={(event) => {
                  // 한글 등 IME 조합을 확정하는 Enter는 다음 단계로 넘기지 않는다.
                  if (event.key !== "Enter" || event.nativeEvent.isComposing) return;

                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }}
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
      <div className={`${saveError ? "mt-3" : "mt-auto"} pt-2 pb-6`}>
        <Button
          className="disabled:bg-gray-50 disabled:text-gray-300 disabled:opacity-100"
          disabled={!isBirthDateValid}
          pending={isSaving}
          size="cta"
          type="submit"
        >
          다음
        </Button>
      </div>
    </form>
  );
}
