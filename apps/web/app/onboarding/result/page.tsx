"use client";

import { ButtonGroup } from "@repo/ui";
import AppleIntelIcon from "@repo/ui/svg/apple-intel.svg";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { SavingsComparisonChart } from "@/app/onboarding/_components/savings-comparison-chart";
import { formatManwon } from "@/lib/format";
import { onboardingReportOptions } from "@/lib/onboarding/queries";

export default function OnboardingResultPage() {
  const router = useRouter();
  const { data: report, isError } = useQuery(onboardingReportOptions());

  // 재조회 실패로는 화면을 내리지 않는다 — react-query가 이전 데이터를 유지한 채 isError를 켠다.
  if (isError && !report) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-5 text-body-b1-500 text-gray-700">
        결과를 불러오지 못했어요. 잠시 후 페이지를 다시 열어주세요.
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-body-b1-500 text-gray-500">
        결과를 불러오는 중…
      </div>
    );
  }

  const { simulation } = report;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-gray-0 px-5 pt-2">
      <h1 className="text-center text-headline-h2-700 text-gray-800">나는 잘하고 있을까?</h1>

      <section className="mt-7 rounded-2xl bg-[#F3F9FE] px-6 py-8 text-center">
        <p className="text-title-t2-700 text-blue-600">저축 계획을 조정하면</p>
        <p className="mt-1 text-headline-h1-700 text-gray-900">
          {formatManwon(simulation.simulationManwon)} 예상
        </p>
        <p className="mt-2 text-body-b1-500 text-gray-500">
          지금 그대로면 {simulation.periodMonths}개월 뒤 {formatManwon(simulation.baselineManwon)}{" "}
          예상
        </p>
      </section>

      <section className="mt-6" aria-labelledby="additional-savings-title">
        <h2
          id="additional-savings-title"
          className="text-center text-headline-h2-700 text-gray-800"
        >
          {simulation.periodMonths}개월간{" "}
          <span className="text-blue-500">{formatManwon(simulation.diffManwon)}</span>
          <br />더 모을 수 있어요
        </h2>
        <SavingsComparisonChart
          currentEstimate={simulation.baselineManwon}
          improvedEstimate={simulation.simulationManwon}
        />
      </section>

      <section className="mt-3 rounded-[14px] bg-gradient-to-r from-[#e6ebff] to-[#e2f8ff] p-5">
        <div className="flex gap-2">
          <AppleIntelIcon aria-hidden="true" className="mt-0.5 size-[17px] shrink-0" />
          <p className="break-words text-body-b2-500 text-gray-800">{report.diagnosis.message}</p>
        </div>
      </section>

      <div className="mt-auto pt-8 pb-6">
        <ButtonGroup
          nextLabel="목표금액 설정하기"
          onNext={() => router.push("/onboarding/goal")}
          onPrev={() => router.push("/onboarding/period")}
        />
      </div>
    </div>
  );
}
