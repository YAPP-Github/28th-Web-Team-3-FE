"use client";

import { AmountField, BottomSheet, ButtonGroup, TextButton } from "@repo/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LabelSlider } from "../../_components/label-slider";

const MAX_AMOUNT = 650;

export default function MonthOnboardingPage() {
  const router = useRouter();
  const [income, setIncome] = useState(0);
  const [savings, setSavings] = useState(0);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const canProceed = income > 0 && savings > 0;

  return (
    <div className="flex min-h-[calc(100dvh-56px)] flex-col px-5 pt-7">
      <section>
        <h1 className="text-headline-h2-700 text-black">
          평균 월급과 월 저축액은
          <br />
          어느 정도인가요?
        </h1>
        <p className="mt-1 text-body-b1-400 text-gray-700">
          소득과 저축 여력에 따라 플랜 강도가 달라져요.
        </p>

        <div className="mt-12 space-y-12">
          <LabelSlider
            helperText="매월 월급이 다르다면 평균으로 설정해주세요."
            label="월급"
            max={MAX_AMOUNT}
            value={income}
            onValueChange={setIncome}
          />
          <LabelSlider
            helperText="매월 저축액이 다르다면 평균으로 설정해주세요."
            label="월 저축액"
            max={MAX_AMOUNT}
            value={savings}
            onValueChange={setSavings}
          />
        </div>
      </section>

      <BottomSheet
        open={isSheetOpen}
        title="직접 입력"
        trigger={<TextButton className="mx-auto mt-12">직접 입력</TextButton>}
        onOpenChange={setIsSheetOpen}
      >
        <div className="flex flex-col gap-12 pt-6">
          <div className="flex gap-2 px-5">
            <AmountField
              label="월급"
              value={income === 0 ? "" : String(income)}
              onChange={(event) => setIncome(Number(event.target.value.replace(/\D/g, "")))}
            />
            <AmountField
              label="월 저축액"
              value={savings === 0 ? "" : String(savings)}
              onChange={(event) => setSavings(Number(event.target.value.replace(/\D/g, "")))}
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

      <div className="mt-auto pt-8 pb-6">
        <ButtonGroup
          nextDisabled={!canProceed}
          onNext={() => router.push("/onboarding/finance")}
          onPrev={() => router.push("/onboarding/age")}
        />
      </div>
    </div>
  );
}
