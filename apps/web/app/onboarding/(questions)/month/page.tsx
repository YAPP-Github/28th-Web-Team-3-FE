"use client";

import { MAX_MONTHLY_AMOUNT, type OnboardingFormValues } from "@repo/schema/onboarding";
import { AmountField, BottomSheet, ButtonGroup, TextButton } from "@repo/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { LabelSlider } from "@/app/onboarding/_components/label-slider";
import { useSaveOnboardingProfile } from "@/app/onboarding/_hooks/use-save-onboarding-profile";
import { MAX_MONTHLY_AMOUNT_SLIDER_VALUE } from "@/app/onboarding/constants/amounts";
import { onlyDigits } from "@/lib/number";

function parseMonthlyAmountInput(inputValue: string) {
  return Math.min(Number(onlyDigits(inputValue)), MAX_MONTHLY_AMOUNT);
}

export default function MonthlyIncomeAndSavingsOnboardingPage() {
  const router = useRouter();
  const [isDirectInputSheetOpen, setIsDirectInputSheetOpen] = useState(false);
  const { control, trigger } = useFormContext<OnboardingFormValues>();
  const [income, savings] = useWatch({
    control,
    name: ["monthlySalaryManwon", "monthlySavingManwon"],
  });
  const hasRequiredMonthlyAmounts = income > 0 && savings > 0;
  const { isSaving, saveError, saveProfile } = useSaveOnboardingProfile();
  const amountError = savings > income ? "월 저축액은 월급보다 클 수 없어요." : undefined;

  async function navigateToNetWorthQuestion() {
    if (
      savings <= income &&
      (await trigger(["monthlySalaryManwon", "monthlySavingManwon"], { shouldFocus: true }))
    ) {
      const saved = await saveProfile({
        monthlySalaryManwon: income,
        monthlySavingManwon: savings,
      });
      if (saved) router.push("/onboarding/net");
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-56px-var(--keyboard-inset,0px))] flex-col justify-between px-5 pt-7">
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
              name="monthlySalaryManwon"
              render={({ field }) => (
                <LabelSlider
                  amount={field.value}
                  amountLabel="월급"
                  helperMessage="매월 월급이 다르다면 평균으로 설정해주세요."
                  maxAmount={MAX_MONTHLY_AMOUNT_SLIDER_VALUE}
                  onAmountChange={field.onChange}
                />
              )}
            />
            <div>
              <Controller
                control={control}
                name="monthlySavingManwon"
                render={({ field }) => (
                  <LabelSlider
                    amount={field.value}
                    amountLabel="월 저축액"
                    helperMessage="매월 저축액이 다르다면 평균으로 설정해주세요."
                    maxAmount={MAX_MONTHLY_AMOUNT_SLIDER_VALUE}
                    onAmountChange={field.onChange}
                  />
                )}
              />
              {amountError ? (
                <p aria-live="polite" className="mt-2 text-body-b2-500 text-error">
                  {amountError}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <BottomSheet
          open={isDirectInputSheetOpen}
          title="직접 입력"
          trigger={<TextButton className="mx-auto">직접 입력</TextButton>}
          onOpenChange={setIsDirectInputSheetOpen}
        >
          <div className="flex flex-col gap-12 pt-6">
            <div className="flex gap-2 px-5">
              <Controller
                control={control}
                name="monthlySalaryManwon"
                render={({ field }) => (
                  <AmountField
                    label="월급"
                    maxLength={String(MAX_MONTHLY_AMOUNT).length}
                    value={field.value ? String(field.value) : ""}
                    onChange={(event) =>
                      field.onChange(parseMonthlyAmountInput(event.target.value))
                    }
                  />
                )}
              />
              <Controller
                control={control}
                name="monthlySavingManwon"
                render={({ field }) => (
                  <AmountField
                    label="월 저축액"
                    maxLength={String(MAX_MONTHLY_AMOUNT).length}
                    value={field.value ? String(field.value) : ""}
                    onChange={(event) =>
                      field.onChange(parseMonthlyAmountInput(event.target.value))
                    }
                  />
                )}
              />
            </div>
            <div className="px-5 pt-2 pb-3">
              <ButtonGroup
                nextDisabled={!hasRequiredMonthlyAmounts}
                nextLabel="완료"
                onNext={() => setIsDirectInputSheetOpen(false)}
              />
            </div>
          </div>
        </BottomSheet>
      </div>

      {saveError ? (
        <p aria-live="polite" className="pt-4 text-center text-body-b2-500 text-error">
          {saveError}
        </p>
      ) : null}
      <div className="pt-2 pb-6">
        <ButtonGroup
          nextDisabled={!hasRequiredMonthlyAmounts || Boolean(amountError)}
          nextPending={isSaving}
          onNext={navigateToNetWorthQuestion}
          onPrev={() => router.replace("/onboarding/address")}
        />
      </div>
    </div>
  );
}
