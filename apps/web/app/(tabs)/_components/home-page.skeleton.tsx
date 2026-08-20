import { FinancialTipListSkeleton } from "./financial-tip-list.skeleton";
import { HomeGoalSectionSkeleton } from "./home-goal-section.skeleton";
import { HomeMissionSectionSkeleton } from "./home-mission-section.skeleton";

/** 온보딩 완료 여부를 확인하는 동안 홈의 첫 화면 구조를 유지한다. */
export function HomePageSkeleton() {
  return (
    <main className="flex flex-1 flex-col gap-8 bg-gray-0">
      <section className="flex flex-col gap-4 px-5">
        <h1 className="py-2 text-title-t1-700 text-gray-900">홈</h1>
        <HomeGoalSectionSkeleton label="홈을 불러오는 중" />
      </section>
      <HomeMissionSectionSkeleton />
      <FinancialTipListSkeleton />
    </main>
  );
}
