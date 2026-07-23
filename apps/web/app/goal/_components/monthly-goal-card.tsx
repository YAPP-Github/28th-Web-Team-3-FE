import { GOAL } from "../constants";

/** 이번 달 목표 현황 카드 — 홈과 목표 상세가 함께 쓴다. */
export function MonthlyGoalCard() {
  const { monthly } = GOAL;

  return (
    <section className="flex flex-col rounded-2xl bg-gray-50 p-4">
      <div className="flex items-start justify-between">
        <h2 className="text-body-b1-700 text-gray-900">이번 달 목표 현황</h2>
        <span className="rounded bg-gray-100 px-2 py-1 text-body-b2-700 text-gray-700">
          {monthly.ddayLabel}
        </span>
      </div>

      <p className="mt-4 flex items-center gap-1">
        <span className="text-headline-h2-700 text-blue-500">{monthly.currentLabel}</span>
        <span className="text-body-b2-500 text-gray-500">/ {monthly.targetLabel}</span>
      </p>

      <div className="mt-4 h-4 overflow-hidden rounded-full bg-gray-200">
        <div className="h-full rounded-full bg-blue-500" style={{ width: `${monthly.percent}%` }} />
      </div>

      <button
        type="button"
        className="mt-4 flex h-[42px] items-center justify-center rounded-lg border-[0.5px] border-gray-200 bg-gray-0 text-body-b2-700 text-gray-700"
      >
        현재 저축액 입력
      </button>
    </section>
  );
}
