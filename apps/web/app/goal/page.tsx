import GoalCoinIcon from "@repo/ui/svg/goal-coin.svg";
import { Pencil } from "lucide-react";
import { GoalHeader } from "./_components/goal-header";
import { MonthlyGoalCard } from "./_components/monthly-goal-card";
import { SemicircleGauge } from "./_components/semicircle-gauge";
import { GOAL } from "./constants";

export default function GoalPage() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-gray-0 pb-10">
      <GoalHeader />

      <div className="flex items-center justify-between px-5 pt-4">
        <span className="flex items-center gap-2">
          <GoalCoinIcon aria-hidden="true" className="size-6 shrink-0" />
          <span className="text-title-t1-700 text-gray-900">{GOAL.title}</span>
        </span>
        <button
          type="button"
          className="flex shrink-0 items-center gap-0.5 text-body-b2-500 text-gray-900"
        >
          수정
          <Pencil aria-hidden="true" className="size-5" strokeWidth={1.6} />
        </button>
      </div>

      <div className="px-5 pt-8">
        <SemicircleGauge
          maxLabel={GOAL.maxLabel}
          minLabel={GOAL.minLabel}
          percent={GOAL.savedPercent}
          savedLabel={GOAL.savedLabel}
        />
      </div>

      <div className="flex flex-col gap-4 px-5 pt-8">
        <section className="flex rounded-2xl bg-gray-50 p-5">
          <div className="flex flex-1 flex-col gap-0.5">
            <p className="text-body-b2-500 text-gray-700">서비스 사용기간</p>
            <p className="text-headline-h2-700 text-gray-900">{GOAL.usageMonthsLabel}</p>
          </div>
          <div className="flex flex-1 flex-col gap-0.5">
            <p className="text-body-b2-500 text-gray-700">목표일까지</p>
            <p className="text-headline-h2-700 text-gray-900">{GOAL.ddayLabel}</p>
          </div>
        </section>

        <MonthlyGoalCard />
      </div>
    </main>
  );
}
