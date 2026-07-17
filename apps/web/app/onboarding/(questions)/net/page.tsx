"use client";

import { MAX_NET_WORTH_AMOUNT, type OnboardingFormValues } from "@repo/schema";
import { AmountField, BottomSheet, ButtonGroup, TextButton } from "@repo/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { NetWorthSlider } from "../../_components/net-worth-slider";

function toNetWorthAmount(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");

  if (digits === "") {
    return "";
  }

  return BigInt(digits) > BigInt(MAX_NET_WORTH_AMOUNT) ? MAX_NET_WORTH_AMOUNT : digits;
}

export default function NetOnboardingPage() {
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { control, trigger, watch } = useFormContext<OnboardingFormValues>();
  const netWorth = watch("netWorth");
  const canProceed = BigInt(netWorth || "0") > 0n;

  async function moveToNextQuestion() {
    if (await trigger("netWorth", { shouldFocus: true })) {
      router.push("/onboarding/finance");
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
            name="netWorth"
            render={({ field }) => (
              <NetWorthSlider value={field.value} onValueChange={field.onChange} />
            )}
          />
        </section>

        <BottomSheet
          open={isSheetOpen}
          title="직접 입력"
          trigger={<TextButton className="mx-auto">직접 입력</TextButton>}
          onOpenChange={setIsSheetOpen}
        >
          <div className="flex flex-col gap-12 pt-6">
            <div className="px-5">
              <Controller
                control={control}
                name="netWorth"
                render={({ field }) => (
                  <AmountField
                    label="순자산"
                    maxLength={MAX_NET_WORTH_AMOUNT.length}
                    value={field.value}
                    onChange={(event) => field.onChange(toNetWorthAmount(event.target.value))}
                  />
                )}
              />
            </div>
            <div className="px-5 pt-2 pb-3">
              <ButtonGroup
                nextDisabled={!canProceed}
                nextLabel="완료"
                onNext={() => setIsSheetOpen(false)}
              />
            </div>
          </div>
        </BottomSheet>
      </div>

      <div className="pt-8 pb-6">
        <ButtonGroup
          nextDisabled={!canProceed}
          onNext={moveToNextQuestion}
          onPrev={() => router.push("/onboarding/month")}
        />
      </div>
    </div>
  );
}
