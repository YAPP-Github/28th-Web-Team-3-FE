"use client";

import { MAX_NET_WORTH_AMOUNT, type OnboardingFormValues } from "@repo/schema";
import { AmountField, BottomSheet, ButtonGroup, TextButton } from "@repo/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { NetWorthSlider } from "@/app/onboarding/_components/net-worth-slider";
import { useSaveOnboardingProfile } from "@/app/onboarding/_hooks/use-save-onboarding-profile";

function parseNetWorthInput(inputValue: string) {
  return Math.min(Number(inputValue.replace(/\D/g, "")), MAX_NET_WORTH_AMOUNT);
}

export default function NetWorthOnboardingPage() {
  const router = useRouter();
  const [isDirectInputSheetOpen, setIsDirectInputSheetOpen] = useState(false);
  const { control, trigger } = useFormContext<OnboardingFormValues>();
  const netWorthAmount = useWatch({ control, name: "netWorthManwon" });
  // 순자산 0은 유효한 답변(모으기 시작 단계)이라 금액이 아니라 "응답했는지"로 다음을 연다.
  const [hasAnswered, setHasAnswered] = useState(false);
  const { isSaving, saveError, saveProfile } = useSaveOnboardingProfile();

  async function navigateToInvestmentPeriodQuestion() {
    if (await trigger("netWorthManwon", { shouldFocus: true })) {
      if (await saveProfile({ netWorthManwon: netWorthAmount })) {
        router.push("/onboarding/period");
      }
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-56px)] flex-col justify-between px-5 pt-7">
      <div className="flex flex-col gap-12">
        <section className="flex flex-col gap-12">
          <div className="flex flex-col gap-1">
            <h1 className="text-headline-h2-700 text-black">
              현재 순자산은
              <br />
              어느 정도인가요?
            </h1>
            <p className="text-body-b1-400 text-gray-700">
              소득과 저축 여력에 따라 플랜 강도가 달라져요.
            </p>
          </div>
          <Controller
            control={control}
            name="netWorthManwon"
            render={({ field }) => (
              <NetWorthSlider
                netWorthAmount={field.value}
                onNetWorthAmountChange={(amount) => {
                  setHasAnswered(true);
                  field.onChange(amount);
                }}
              />
            )}
          />
        </section>

        <BottomSheet
          open={isDirectInputSheetOpen}
          title="직접 입력"
          trigger={<TextButton className="mx-auto">직접 입력</TextButton>}
          onOpenChange={setIsDirectInputSheetOpen}
        >
          <div className="flex flex-col gap-12 pt-6">
            <div className="px-5">
              <Controller
                control={control}
                name="netWorthManwon"
                render={({ field }) => (
                  <AmountField
                    label="순자산"
                    maxLength={String(MAX_NET_WORTH_AMOUNT).length}
                    value={field.value ? String(field.value) : ""}
                    onChange={(event) => {
                      setHasAnswered(true);
                      field.onChange(parseNetWorthInput(event.target.value));
                    }}
                  />
                )}
              />
            </div>
            <div className="px-5 pt-2 pb-3">
              <ButtonGroup nextLabel="완료" onNext={() => setIsDirectInputSheetOpen(false)} />
            </div>
          </div>
        </BottomSheet>
      </div>

      {saveError ? (
        <p aria-live="polite" className="pt-4 text-center text-body-b2-500 text-gray-700">
          {saveError}
        </p>
      ) : null}
      <div className="pt-8 pb-6">
        <ButtonGroup
          nextDisabled={!hasAnswered || isSaving}
          nextLabel={isSaving ? "저장 중…" : "다음"}
          onNext={navigateToInvestmentPeriodQuestion}
          onPrev={() => router.push("/onboarding/month")}
        />
      </div>
    </div>
  );
}
