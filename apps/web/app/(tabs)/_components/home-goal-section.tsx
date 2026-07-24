"use client";

import { MonthlyGoalCard } from "@/app/goal/_components/monthly-goal-card";
import { formatDday, formatManwon } from "@/app/goal/lib/format";
import { useGoalStatus } from "@/app/goal/queries";
import { GoalTrackerRow } from "./goal-tracker-row";

/**
 * 홈의 목표 섹션 — "N만원 모으기" 라인 + 이번 달 목표 현황 카드.
 * 목표 상세와 같은 `useGoalStatus`(캐시 공유)로 실데이터를 그린다.
 */
export function HomeGoalSection() {
  const { data: goal, isPending, isError } = useGoalStatus();

  if (isPending) {
    // 라인 + 이번 달 카드 실제 높이에 근사시켜 데이터 도착 시 레이아웃 시프트를 줄인다.
    return <div aria-busy="true" className="h-64" />;
  }

  if (isError) {
    return (
      <p className="text-body-b2-500 text-gray-500">
        목표를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
      </p>
    );
  }

  const { thisMonth } = goal;

  return (
    <>
      <GoalTrackerRow targetAmountManwon={goal.targetAmountManwon} />
      <MonthlyGoalCard
        currentLabel={formatManwon(thisMonth.savedManwon)}
        ddayLabel={formatDday(thisMonth.dDay)}
        percent={thisMonth.progressPercent}
        targetLabel={formatManwon(thisMonth.targetManwon)}
      />
    </>
  );
}
