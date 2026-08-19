"use client";

import Bill from "@repo/ui/svg/bill.svg";
import Pencil from "@repo/ui/svg/pencil.svg";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { formatManwon } from "@/lib/format";
import { goalStatusOptions } from "@/lib/queries/goal";
import { GOAL_TITLE_SUFFIX } from "../constants";
import { formatDday } from "../lib/format";
import { calculateGoalProgressPercent, calculateGoalTotalTargetManwon } from "../lib/progress";
import { GoalDetailSkeleton } from "./goal-detail-skeleton";
import { MonthlyGoalCard } from "./monthly-goal-card";
import { MonthlySavingsChart } from "./monthly-savings-chart";
import { SavingsInputSheet } from "./savings-input-sheet";
import { SemicircleGauge } from "./semicircle-gauge";

/** 목표 상세 본문 — 목표 현황을 조회해 게이지·카드로 그리고, 저축 입력/수정 시트를 연다. */
export function GoalDetail() {
  const { data: goal, isPending, isError, isFetching, refetch } = useQuery(goalStatusOptions());
  const [savingsOpen, setSavingsOpen] = useState(false);

  if (isPending) {
    return <GoalDetailSkeleton />;
  }

  // 재조회 실패로는 화면을 내리지 않는다 — react-query가 이전 데이터를 유지한 채 isError를 켠다.
  if (isError && !goal) {
    return (
      <p className="px-5 pt-20 text-center text-body-b2-500 text-gray-500">
        목표를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
      </p>
    );
  }

  const { thisMonth } = goal;
  const totalTargetManwon = calculateGoalTotalTargetManwon(
    goal.totalSavedManwon,
    goal.targetAmountManwon,
  );
  const progressPercent = calculateGoalProgressPercent(goal.totalSavedManwon, totalTargetManwon);

  return (
    <>
      {/* 이전 데이터가 남아 있는 재조회 실패. 저장 자체는 성공했을 수 있으므로(저장 뒤 갱신만
          실패한 경우) 저장 실패로 말하지 않는다 — 지금 보이는 값이 최신이 아닐 수 있다는
          사실만 알리고 다시 불러올 방법을 준다. */}
      {isError ? (
        <div
          aria-live="polite"
          className="mx-5 mt-4 flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-4 py-3"
        >
          <p className="text-body-b2-500 text-gray-700">
            최신 정보를 불러오지 못했어요. 아래는 마지막으로 불러온 값이에요.
          </p>
          <button
            className="shrink-0 text-body-b2-700 text-blue-500 underline disabled:text-gray-400"
            disabled={isFetching}
            onClick={() => refetch()}
            type="button"
          >
            다시 불러오기
          </button>
        </div>
      ) : null}

      <div className="flex items-center justify-between px-5 pt-4">
        <span className="flex items-center gap-2">
          <Bill aria-hidden="true" className="h-6.25 w-8 shrink-0" />
          <span className="text-title-t1-700 text-gray-900">
            {formatManwon(totalTargetManwon)} {GOAL_TITLE_SUFFIX}
          </span>
        </span>
        {/*
          글자 높이(21px)만으로는 터치 목표 44px에 한참 못 미친다. 음수 마진으로 히트 영역만
          위아래로 넓히고 안쪽 여백으로 되돌려, 보이는 자리는 시안 그대로 두면서 누를 수 있는
          범위를 넓힌다(혜택 카드의 저장 별과 같은 방식).
        */}
        <Link
          href="/profile/edit"
          className="-my-3 -mr-2 flex h-11 shrink-0 items-center gap-0.5 rounded-lg px-2 text-body-b2-500 text-gray-900 transition-colors duration-100 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:bg-gray-50 motion-reduce:transition-none"
        >
          수정
          <Pencil aria-hidden="true" className="size-5" />
        </Link>
      </div>

      <div className="px-5 pt-12">
        <SemicircleGauge
          maxLabel={formatManwon(totalTargetManwon)}
          minLabel="0"
          percent={progressPercent}
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

      <MonthlySavingsChart
        monthlySavings={goal.monthlySavings}
        targetManwon={thisMonth.targetManwon}
      />

      <SavingsInputSheet
        initialManwon={thisMonth.savedManwon}
        open={savingsOpen}
        onOpenChange={setSavingsOpen}
      />
    </>
  );
}
