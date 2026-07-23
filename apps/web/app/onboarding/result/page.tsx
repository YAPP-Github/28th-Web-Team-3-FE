"use client";

import type { OnboardingFormValues } from "@repo/schema";
import { ButtonGroup } from "@repo/ui";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFormContext, useWatch } from "react-hook-form";
import { SavingsComparisonChart } from "@/app/onboarding/_components/savings-comparison-chart";

const PERIOD_MONTHS = {
  "about-six-months": 6,
  "about-one-year": 12,
  "about-one-and-a-half-years": 18,
  "about-two-years": 24,
  "about-two-and-a-half-years": 30,
  "about-three-years": 36,
} as const;

function formatAmount(amount: number) {
  return `${Math.round(amount).toLocaleString("ko-KR")}만원`;
}

export default function OnboardingResultPage() {
  const router = useRouter();
  const { control } = useFormContext<OnboardingFormValues>();
  const [netWorth, savings, investmentPeriod] = useWatch({
    control,
    name: ["netWorth", "savings", "investmentPeriod"],
  });
  const months = investmentPeriod ? PERIOD_MONTHS[investmentPeriod] : 0;
  const currentEstimate = Number(netWorth || 0) + savings * months;
  const improvedEstimate = Number(netWorth || 0) + savings * 1.15 * months;
  const additionalAmount = improvedEstimate - currentEstimate;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-gray-0 px-5 pt-14">
      <h1 className="text-center text-headline-h2-700 text-gray-800">나는 잘하고 있을까?</h1>

      <section className="mt-7 rounded-2xl bg-blue-50 px-6 py-8 text-center">
        <p className="text-title-t2-700 text-blue-600">저축률을 15% 늘리면</p>
        <p className="mt-1 text-headline-h1-700 text-gray-900">
          {formatAmount(improvedEstimate)} 예상
        </p>
        <p className="mt-2 text-body-b1-500 text-gray-500">
          지금 그대로면 {months}개월 뒤 {formatAmount(currentEstimate)} 예상
        </p>
      </section>

      <section className="mt-6" aria-labelledby="additional-savings-title">
        <h2
          id="additional-savings-title"
          className="text-center text-headline-h2-700 text-gray-800"
        >
          {months}개월간 <span className="text-blue-500">{formatAmount(additionalAmount)}</span>
          <br />더 모을 수 있어요
        </h2>
        <SavingsComparisonChart
          currentEstimate={currentEstimate}
          improvedEstimate={improvedEstimate}
        />
      </section>

      <section className="mt-3 rounded-[14px] bg-gradient-to-r from-[#e6ebff] to-[#e2f8ff] p-5">
        <div className="flex gap-2">
          <Sparkles aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-blue-500" />
          <p className="text-body-b2-500 text-gray-800">
            현재 모은 {formatAmount(Number(netWorth || 0))}에서 월 저축액을 15% 높이면, {months}개월
            뒤 {formatAmount(additionalAmount)}을 더 모을 수 있어요.
          </p>
        </div>
      </section>

      <div className="mt-auto pt-6 pb-6">
        <ButtonGroup
          onPrev={() => router.push("/onboarding/period")}
          nextLabel="목표금액 설정하기"
        />
      </div>
    </div>
  );
}
