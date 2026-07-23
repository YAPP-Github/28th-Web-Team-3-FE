import { MonthlyGoalCard } from "@/app/goal/_components/monthly-goal-card";
import { GoalTrackerRow } from "./_components/goal-tracker-row";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col gap-4 bg-gray-0 px-5 pt-2">
      <h1 className="flex h-11 items-center text-title-t1-700 text-gray-900">홈</h1>
      <GoalTrackerRow />
      <MonthlyGoalCard />
    </main>
  );
}
