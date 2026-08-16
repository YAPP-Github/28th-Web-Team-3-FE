import { Button } from "@repo/ui";

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

      {/* 이번 달 저축액은 시안에서 파란색이다 — 목표 금액과 같은 회색으로 두면 무엇이
          내가 채운 값인지 안 드러난다. */}
      <p className="mt-3 flex items-center gap-0.5">
        <span className="text-headline-h2-700 text-blue-500">{currentLabel}</span>
        <span className="text-body-b2-500 text-gray-500">/ {targetLabel}</span>
      </p>

      <div className="mt-3 h-4 overflow-hidden rounded-full bg-gray-200" data-monthly-progress>
        <div className="h-full rounded-full bg-blue-500" style={{ width: `${percent}%` }} />
      </div>
      <Button
        // `font-bold`를 함께 준다 — Button 기본 스타일의 `font-medium`이 타이포 토큰과 다른
        // 그룹이라 twMerge가 지우지 못하고, CSS 순서상 뒤에 있어 굵기만 500으로 남는다.
        className="mt-4 h-[42px] rounded-lg border-[0.5px] border-gray-200 bg-white font-bold text-body-b2-700 text-gray-700"
        disabled={savePending}
        onClick={onSaveClick}
        type="button"
      >
        현재 저축액 입력
      </Button>
    </section>
  );
}
