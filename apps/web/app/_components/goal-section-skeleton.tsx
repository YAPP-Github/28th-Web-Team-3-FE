import { cn, Skeleton } from "@repo/ui";
import { LoadingRegion } from "./loading-region";

interface GoalSectionSkeletonProps {
  className?: string;
  /** 스크린리더가 읽을 문장. 한 화면에 자리표시자가 여럿이면 하나에만 준다. */
  label?: string;
}

/**
 * 목표 조회를 기다리는 동안 깔아두는 뼈대 — "N만원 모으기" 라인 + 이번 달 목표 현황 카드.
 * 홈과 목표 상세가 같은 골격이라 함께 쓴다.
 *
 * 문구 한 줄로 때우면 데이터가 도착하는 순간 아래 미션 섹션까지 통째로 밀린다.
 */
export function GoalSectionSkeleton({ className, label }: GoalSectionSkeletonProps) {
  return (
    <LoadingRegion className={cn("flex flex-col gap-4", className)} label={label}>
      {/* "N만원 모으기" 라인 */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Skeleton className="h-6.25 w-8 shrink-0" />
          <Skeleton className="h-7 w-40" />
        </span>
        <Skeleton className="size-5 shrink-0" />
      </div>

      {/* 이번 달 목표 현황 카드 */}
      <section className="flex flex-col gap-4 rounded-2xl bg-gray-50 p-4">
        <div className="flex items-start justify-between">
          <Skeleton className="h-6 w-28 bg-gray-100" />
          <Skeleton className="h-7 w-12 bg-gray-100" />
        </div>
        <Skeleton className="h-9 w-36 bg-gray-100" />
        <Skeleton className="h-4 w-full rounded-full bg-gray-100" />
        <Skeleton className="h-[42px] w-full rounded-md bg-gray-100" />
      </section>
    </LoadingRegion>
  );
}
