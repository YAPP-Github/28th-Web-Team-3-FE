"use client";

import GoalCoinIcon from "@repo/ui/svg/goal-coin.svg";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { GOAL_TITLE_SUFFIX } from "../constants";
import { formatDday, formatManwon } from "../lib/format";
import { useGoalStatus } from "../queries";
import { GoalEditSheet } from "./goal-edit-sheet";
import { MonthlyGoalCard } from "./monthly-goal-card";
import { SavingsInputSheet } from "./savings-input-sheet";
import { SemicircleGauge } from "./semicircle-gauge";

/** 목표 상세 본문 — 목표 현황을 조회해 게이지·카드로 그리고, 저축 입력/수정 시트를 연다. */
export function GoalDetail() {
  const { data: goal, isPending, isError } = useGoalStatus();
  const [savingsOpen, setSavingsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  if (isPending) {
    return <p className="px-5 pt-20 text-center text-body-b2-500 text-gray-400">불러오는 중…</p>;
  }

  if (isError) {
    return (
      <p className="px-5 pt-20 text-center text-body-b2-500 text-gray-500">
        목표를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
      </p>
    );
  }

  const { thisMonth } = goal;

  return (
    <>
      <div className="flex items-center justify-between px-5 pt-4">
        <span className="flex items-center gap-2">
          <GoalCoinIcon aria-hidden="true" className="size-6 shrink-0" />
          <span className="text-title-t1-700 text-gray-900">
            {formatManwon(goal.targetAmountManwon)} {GOAL_TITLE_SUFFIX}
          </span>
        </span>
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="flex shrink-0 items-center gap-0.5 text-body-b2-500 text-gray-900"
        >
          수정
          <Pencil aria-hidden="true" className="size-5" strokeWidth={1.6} />
        </button>
      </div>

      <div className="px-5 pt-8">
        <SemicircleGauge
          maxLabel={formatManwon(goal.targetAmountManwon)}
          minLabel="0"
          percent={goal.progressPercent}
          savedLabel={formatManwon(goal.totalSavedManwon)}
        />
      </div>

      <div className="flex flex-col gap-4 px-5 pt-8">
        <section className="flex rounded-2xl bg-gray-50 p-5">
          <div className="flex flex-1 flex-col gap-0.5">
            <p className="text-body-b2-500 text-gray-700">서비스 사용기간</p>
            <p className="text-headline-h2-700 text-gray-900">{goal.usageMonths}개월째</p>
          </div>
          <div className="flex flex-1 flex-col gap-0.5">
            <p className="text-body-b2-500 text-gray-700">목표일까지</p>
            <p className="text-headline-h2-700 text-gray-900">{formatDday(goal.deadlineDDay)}</p>
          </div>
        </section>

        <MonthlyGoalCard
          currentLabel={formatManwon(thisMonth.savedManwon)}
          ddayLabel={formatDday(thisMonth.dDay)}
          percent={thisMonth.progressPercent}
          targetLabel={formatManwon(thisMonth.targetManwon)}
          onSaveClick={() => setSavingsOpen(true)}
        />
      </div>

      <SavingsInputSheet
        initialManwon={goal.totalSavedManwon}
        open={savingsOpen}
        onOpenChange={setSavingsOpen}
      />
      <GoalEditSheet
        initialTargetManwon={goal.targetAmountManwon}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
