"use client";

import { FinancialTipList } from "./_components/financial-tip-list";
import { HomeGoalSection } from "./_components/home-goal-section";
import { WeeklyMissionSection } from "./_components/weekly-mission-section";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col gap-8 bg-gray-0">
      <section className="flex flex-col gap-4 px-5">
        <h1 className="py-2 text-title-t1-700 text-gray-900">홈</h1>
        <HomeGoalSection />
      </section>
      <WeeklyMissionSection />
      <FinancialTipList />
    </main>
  );
}
