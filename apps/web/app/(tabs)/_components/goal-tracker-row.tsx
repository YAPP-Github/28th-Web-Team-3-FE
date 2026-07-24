import Bill from "@repo/ui/svg/bill.svg";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { GOAL } from "@/app/goal/constants";

/** 홈 상단 "5,000만원 모으기" 라인. 전체가 목표 상세로 가는 링크다. */
export function GoalTrackerRow() {
  return (
    <Link href="/goal" className="flex items-center justify-between">
      <span className="flex items-center gap-2">
        <Bill aria-hidden="true" className="width-8 height-[25px] shrink-0" />
        <span className="text-title-t1-700 text-gray-900">{GOAL.title}</span>
      </span>
      <ChevronRight
        aria-hidden="true"
        className="size-5 shrink-0 text-gray-900"
        strokeWidth={1.4}
      />
    </Link>
  );
}
