"use client";

import { MAX_MONTHLY_AMOUNT, type OnboardingFormValues } from "@repo/schema";
import { AmountField, BottomSheet, ButtonGroup, TextButton } from "@repo/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { LabelSlider } from "../../_components/label-slider";

const SLIDER_MAX_AMOUNT = 650;

function toMonthlyAmount(value: string) {
  return Math.min(Number(value.replace(/\D/g, "")), MAX_MONTHLY_AMOUNT);
}

export default function MonthOnboardingPage() {
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { control, trigger, watch } = useFormContext<OnboardingFormValues>();
  const income = watch("income");
  const savings = watch("savings");
  const canProceed = income > 0 && savings > 0;

  async function moveToNextQuestion() {
    if (await trigger(["income", "savings"], { shouldFocus: true })) {
      router.push("/onboarding/finance");
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-56px)] flex-col justify-between px-5 pt-7">
      <div className="flex flex-col gap-12">
        <section className="flex flex-col gap-12">
          <div className="flex flex-col gap-1">
            <h1 className="text-headline-h2-700 text-black">
              평균 월급과 월 저축액은
              <br />
              어느 정도인가요?
            </h1>
            <p className="text-body-b1-400 text-gray-700">
              소득과 저축 여력에 따라 플랜 강도가 달라져요.
            </p>
          </div>
          <div className="flex flex-col gap-12">
            <Controller
              control={control}
              name="income"
              render={({ field }) => (
                <LabelSlider
                  helperText="매월 월급이 다르다면 평균으로 설정해주세요."
                  label="월급"
                  max={SLIDER_MAX_AMOUNT}
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="savings"
              render={({ field }) => (
                <LabelSlider
                  helperText="매월 저축액이 다르다면 평균으로 설정해주세요."
                  label="월 저축액"
                  max={SLIDER_MAX_AMOUNT}
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
          </div>
        </section>

        <BottomSheet
          open={isSheetOpen}
          title="직접 입력"
          trigger={<TextButton className="mx-auto">직접 입력</TextButton>}
          onOpenChange={setIsSheetOpen}
        >
          <div className="flex flex-col gap-12 pt-6">
            <div className="flex gap-2 px-5">
              <Controller
                control={control}
                name="income"
                render={({ field }) => (
                  <AmountField
                    label="월급"
                    maxLength={String(MAX_MONTHLY_AMOUNT).length}
                    value={field.value === 0 ? "" : String(field.value)}
                    onChange={(event) => field.onChange(toMonthlyAmount(event.target.value))}
                  />
                )}
              />
              <Controller
                control={control}
                name="savings"
                render={({ field }) => (
                  <AmountField
                    label="월 저축액"
                    maxLength={String(MAX_MONTHLY_AMOUNT).length}
                    value={field.value === 0 ? "" : String(field.value)}
                    onChange={(event) => field.onChange(toMonthlyAmount(event.target.value))}
                  />
                )}
              />
            </div>
            <div className="px-5 pt-2 pb-3">
              <ButtonGroup
                nextDisabled={!canProceed}
                nextLabel="완료"
                onNext={moveToNextQuestion}
              />
            </div>
          </div>
        </BottomSheet>
      </div>

      <div className="pt-8 pb-6">
        <ButtonGroup
          nextDisabled={!canProceed}
          onNext={moveToNextQuestion}
          onPrev={() => router.push("/onboarding/age")}
        />
      </div>
    </div>
  );
}
