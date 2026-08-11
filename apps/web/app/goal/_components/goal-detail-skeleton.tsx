import { Skeleton } from "@repo/ui";
import { LoadingRegion } from "@/app/_components/loading-region";

/**
 * 목표 상세의 대기 뼈대 — 헤더 + 반원 게이지 + 사용기간 카드 + 이번 달 카드.
 *
 * 홈의 `GoalSectionSkeleton`을 그대로 쓰면 게이지와 사용기간 카드 자리가 통째로 비어 있다가
 * 데이터가 도착할 때 끼어들어, 문구 한 줄을 쓰던 때보다 오히려 크게 밀린다.
 */
export function GoalDetailSkeleton() {
  return (
    <LoadingRegion label="목표를 불러오는 중">
      {/* "N만원 모으기" + 수정 */}
      <div className="flex items-center justify-between px-5 pt-4">
        <span className="flex items-center gap-2">
          <Skeleton className="h-6.25 w-8 shrink-0" />
          <Skeleton className="h-7 w-40" />
        </span>
        <Skeleton className="h-6 w-14 shrink-0" />
      </div>

      {/* 반원 게이지 — viewBox 240×128의 세로비를 따라간다. */}
      <div className="px-5 pt-12">
        <Skeleton className="aspect-[240/128] w-full rounded-2xl" />
      </div>

      <div className="flex flex-col gap-4 px-5 pt-8">
        {/* 서비스 사용기간 / 목표일까지 */}
        <section className="flex rounded-2xl bg-gray-50 p-5">
          <div className="flex flex-1 flex-col gap-0.5">
            <Skeleton className="h-5 w-24 bg-gray-100" />
            <Skeleton className="mt-1 h-9 w-20 bg-gray-100" />
          </div>
          <div className="flex flex-1 flex-col gap-0.5">
            <Skeleton className="h-5 w-20 bg-gray-100" />
            <Skeleton className="mt-1 h-9 w-16 bg-gray-100" />
          </div>
        </section>

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
      </div>
    </LoadingRegion>
  );
}
