interface MonthlyGoalCardProps {
  ddayLabel: string;
  currentLabel: string;
  targetLabel: string;
  /** 채움 비율 0–100. */
  percent: number;
  /** "현재 저축액 입력" 동작. 없으면 버튼은 표시만 하고 눌러도 아무 일도 없다(홈). */
  onSaveClick?: () => void;
  /** 저축액 입력 진행 중(버튼 비활성). */
  savePending?: boolean;
}

/** 이번 달 목표 현황 카드 — 홈(정적)과 목표 상세(API)가 함께 쓴다. */
export function MonthlyGoalCard({
  ddayLabel,
  currentLabel,
  targetLabel,
  percent,
  onSaveClick,
  savePending = false,
}: MonthlyGoalCardProps) {
  return (
    <section className="flex flex-col rounded-2xl bg-gray-50 p-4">
      <div className="flex items-start justify-between">
        <h2 className="text-body-b1-700 text-gray-900">이번 달 목표 현황</h2>
        <span className="rounded bg-gray-100 px-2 py-1 text-body-b2-700 text-gray-700">
          {ddayLabel}
        </span>
      </div>

      <p className="mt-4 flex items-center gap-1">
        <span className="text-headline-h2-700 text-blue-500">{currentLabel}</span>
        <span className="text-body-b2-500 text-gray-500">/ {targetLabel}</span>
      </p>

      <div className="mt-4 h-4 overflow-hidden rounded-full bg-gray-200">
        <div className="h-full rounded-full bg-blue-500" style={{ width: `${percent}%` }} />
      </div>

      <button
        type="button"
        disabled={savePending}
        onClick={onSaveClick}
        className="mt-4 flex h-[42px] items-center justify-center rounded-lg border-[0.5px] border-gray-200 bg-gray-0 text-body-b2-700 text-gray-700 disabled:opacity-60"
      >
        현재 저축액 입력
      </button>
    </section>
  );
}
