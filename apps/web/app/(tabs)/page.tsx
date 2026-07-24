"use client";

import { Button } from "@repo/ui";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getOnboardingProfile } from "@/lib/onboarding";
import { FinancialTipList } from "./_components/financial-tip-list";
import { HomeGoalSection } from "./_components/home-goal-section";
import { WeeklyMissionSection } from "./_components/weekly-mission-section";
import { FINANCIAL_TIPS } from "./benefits/constants";

export default function HomePage() {
  const router = useRouter();
  const [isOnboardingChecked, setIsOnboardingChecked] = useState(false);
  const [hasProfileError, setHasProfileError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setHasProfileError(false);
    getOnboardingProfile()
      .then((profile) => {
        if (profile.status === "IN_PROGRESS") {
          router.replace("/onboarding/intro");
          return;
        }

        setIsOnboardingChecked(true);
      })
      .catch(() => {
        setHasProfileError(true);
      });
  }, [retryCount, router]);

  if (hasProfileError) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="text-body-b1-500 text-gray-700">
          사용자 정보를 불러오지 못했어요.
          <br />
          잠시 후 다시 시도해주세요.
        </p>
        <Button size="cta" className="max-w-52" onClick={() => setRetryCount((count) => count + 1)}>
          다시 시도
        </Button>
      </main>
    );
  }

  if (!isOnboardingChecked) {
    return <main aria-busy="true" className="flex flex-1" />;
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
