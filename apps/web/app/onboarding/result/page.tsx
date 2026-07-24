"use client";

import type { OnboardingReport } from "@repo/schema/onboarding-api";
import { ButtonGroup } from "@repo/ui";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SavingsComparisonChart } from "@/app/onboarding/_components/savings-comparison-chart";
import { getOnboardingReport } from "@/lib/onboarding-api";

function formatAmount(amount: number) {
  return `${amount.toLocaleString("ko-KR")}만원`;
}

export default function OnboardingResultPage() {
  const router = useRouter();
  const [report, setReport] = useState<OnboardingReport>();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;

    getOnboardingReport()
      .then((nextReport) => {
        if (!active) return;
        setReport(nextReport);
      })
      .catch(() => {
        if (active) setHasError(true);
      });

    return () => {
      active = false;
    };
  }, []);

  if (hasError) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-5 text-body-b1-500 text-gray-700">
        결과를 불러오지 못했어요. 잠시 후 페이지를 다시 열어주세요.
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-body-b1-500 text-gray-500">
        결과를 불러오고 있어요…
      </div>
    );
  }

  const { simulation } = report;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-gray-0 px-5 pt-14">
      <h1 className="text-center text-headline-h2-700 text-gray-800">나는 잘하고 있을까?</h1>

      <section className="mt-7 rounded-2xl bg-blue-50 px-6 py-8 text-center">
        <p className="text-title-t2-700 text-blue-600">저축 계획을 조정하면</p>
        <p className="mt-1 text-headline-h1-700 text-gray-900">
          {formatAmount(simulation.simulationManwon)} 예상
        </p>
        <p className="mt-2 text-body-b1-500 text-gray-500">
          지금 그대로면 {simulation.periodMonths}개월 뒤 {formatAmount(simulation.baselineManwon)}{" "}
          예상
        </p>
      </section>

      <section className="mt-6" aria-labelledby="additional-savings-title">
        <h2
          id="additional-savings-title"
          className="text-center text-headline-h2-700 text-gray-800"
        >
          {simulation.periodMonths}개월간{" "}
          <span className="text-blue-500">{formatAmount(simulation.diffManwon)}</span>
          <br />더 모을 수 있어요
        </h2>
        <SavingsComparisonChart
          currentEstimate={simulation.baselineManwon}
          improvedEstimate={simulation.simulationManwon}
        />
      </section>

      <section className="mt-3 rounded-[14px] bg-gradient-to-r from-[#e6ebff] to-[#e2f8ff] p-5">
        <div className="flex gap-2">
          <Sparkles aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-blue-500" />
          <p className="break-words text-body-b2-500 text-gray-800">{report.diagnosis.message}</p>
        </div>
      </section>

      <div className="mt-auto pt-8 pb-6">
        <ButtonGroup
          onNext={() => router.push("/onboarding/goal")}
          onPrev={() => router.push("/onboarding/period")}
        />
      </div>
    </div>
  );
}
