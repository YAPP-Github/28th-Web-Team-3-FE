"use client";

import { Button } from "@repo/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { onboardingProfileOptions } from "@/lib/onboarding/queries";
import { FinancialTipList } from "./_components/financial-tip-list";
import { HomeGoalSection } from "./_components/home-goal-section";
import { WeeklyMissionSection } from "./_components/weekly-mission-section";
import { FINANCIAL_TIPS } from "./benefits/constants";

export default function HomePage() {
  const router = useRouter();
  const { data: profile, isError, refetch } = useQuery(onboardingProfileOptions());
  const isOnboardingInProgress = profile?.status === "IN_PROGRESS";

  useEffect(() => {
    if (isOnboardingInProgress) router.replace("/onboarding/intro");
  }, [isOnboardingInProgress, router]);

  // 캐시된 프로필이 있으면 재조회가 실패해도 화면을 내리지 않는다 — react-query는 재조회
  // 실패 시 이전 데이터를 유지한 채 isError를 켜므로, isError만 보면 멀쩡히 그릴 수 있는
  // 화면이 오류 화면으로 바뀐다.
  if (isError && !profile) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="text-body-b1-500 text-gray-700">
          사용자 정보를 불러오지 못했어요.
          <br />
          잠시 후 다시 시도해주세요.
        </p>
        <Button size="cta" className="max-w-52" onClick={() => refetch()}>
          다시 시도
        </Button>
      </main>
    );
  }

  // 온보딩 미완료면 리다이렉트가 걸리는 중이라 홈 내용을 잠깐이라도 보여주지 않는다.
  if (!profile || isOnboardingInProgress) {
    return (
      <main aria-busy="true" className="fixed inset-0 z-[60] bg-gray-0">
        <span className="sr-only">사용자 정보를 확인하는 중</span>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col bg-gray-0">
      <section className="flex flex-col gap-4 px-5">
        <h1 className="py-2 text-title-t1-700 text-gray-900">홈</h1>
        <HomeGoalSection />
      </section>
      <WeeklyMissionSection />
      <FinancialTipList tips={FINANCIAL_TIPS} />
    </main>
  );
}
