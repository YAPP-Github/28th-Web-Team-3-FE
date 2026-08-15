import BillBox from "@repo/ui/svg/bill-box.svg";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { GOAL_TITLE_SUFFIX } from "@/app/goal/constants";
import { formatManwon } from "@/lib/format";

interface GoalTrackerRowProps {
  /** 현재까지 모은 금액(만원). */
  currentAmountManwon: number;
  /** 목표 금액(만원) — API 응답값. `"5,000만원 모으기"` 라인 제목을 파생한다. */
  targetAmountManwon: number;
}

/** 홈 상단 "N만원 모으기" 라인. 전체가 목표 상세로 가는 링크다. */
export function GoalTrackerRow({ currentAmountManwon, targetAmountManwon }: GoalTrackerRowProps) {
  return (
    <Link href="/goal" className="flex items-center justify-between">
      <span className="flex min-w-0 items-center gap-1.5">
        <span className="flex min-w-0 items-center gap-2">
          <BillBox aria-hidden="true" className="size-[30px] shrink-0" />
          <span className="truncate text-title-t1-700 text-gray-900">
            {formatManwon(targetAmountManwon)} {GOAL_TITLE_SUFFIX}
          </span>
        </span>
        <span className="shrink-0 rounded bg-[#e2f8ec] px-1 py-0.5 text-caption-c1-500 text-[#009166]">
          현재 {formatManwon(currentAmountManwon)}
        </span>
      </span>
      <ChevronRight
        aria-hidden="true"
        className="size-5 shrink-0 text-gray-900"
        strokeWidth={1.4}
      />
    </Link>
  );
}
