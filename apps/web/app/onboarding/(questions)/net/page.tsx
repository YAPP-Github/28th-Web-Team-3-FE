"use client";

import { MAX_NET_WORTH_AMOUNT, type OnboardingFormValues } from "@repo/schema";
import { AmountField, BottomSheet, ButtonGroup, TextButton } from "@repo/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { NetWorthSlider } from "@/app/onboarding/_components/net-worth-slider";

function parseNetWorthInput(inputValue: string) {
  const numericValue = inputValue.replace(/\D/g, "").replace(/^0+(?=\d)/, "");

  if (numericValue === "") {
    return "";
  }

  return BigInt(numericValue) > BigInt(MAX_NET_WORTH_AMOUNT) ? MAX_NET_WORTH_AMOUNT : numericValue;
}

export default function NetWorthOnboardingPage() {
  const router = useRouter();
  const [isDirectInputSheetOpen, setIsDirectInputSheetOpen] = useState(false);
  const { control, trigger } = useFormContext<OnboardingFormValues>();
  const netWorthAmount = useWatch({ control, name: "netWorth" });
  const hasNetWorthAmount = BigInt(netWorthAmount || "0") > 0n;

  async function navigateToInvestmentPeriodQuestion() {
    if (await trigger("netWorth", { shouldFocus: true })) {
      router.push("/onboarding/period");
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
              <NetWorthSlider
                netWorthAmount={field.value}
                onNetWorthAmountChange={field.onChange}
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
                name="netWorth"
                render={({ field }) => (
                  <AmountField
                    label="순자산"
                    maxLength={MAX_NET_WORTH_AMOUNT.length}
                    value={field.value || ""}
                    onChange={(event) => field.onChange(parseNetWorthInput(event.target.value))}
                  />
                )}
              />
            </div>
            <div className="px-5 pt-2 pb-3">
              <ButtonGroup
                nextDisabled={!hasNetWorthAmount}
                nextLabel="완료"
                onNext={() => setIsDirectInputSheetOpen(false)}
              />
            </div>
          </div>
        </BottomSheet>
      </div>

      <div className="pt-8 pb-6">
        <ButtonGroup
          nextDisabled={!hasNetWorthAmount}
          onNext={navigateToInvestmentPeriodQuestion}
          onPrev={() => router.push("/onboarding/month")}
        />
      </div>
    </div>
  );
}
