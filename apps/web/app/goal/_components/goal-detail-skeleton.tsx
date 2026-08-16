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

      {/* 게이지 — 실제 호와 같은 폭(78%)·세로비(260×142)에 끝 라벨 줄까지 맞춘다.
          어긋나면 데이터가 도착할 때 아래 카드가 그 차이만큼 밀린다. */}
      <div className="flex flex-col items-center px-5 pt-12">
        <div className="w-full max-w-[78%]">
          <Skeleton className="aspect-[260/142] w-full rounded-2xl" />
          <Skeleton className="mt-1.5 h-[18px] w-full" />
        </div>
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
        <section className="flex flex-col rounded-2xl bg-gray-50 p-4">
          <div className="flex items-start justify-between">
            <Skeleton className="h-6 w-28 bg-gray-100" />
            <Skeleton className="h-7 w-12 bg-gray-100" />
          </div>
          <Skeleton className="mt-3 h-9 w-36 bg-gray-100" />
          <Skeleton className="mt-3 h-4 w-full rounded-full bg-gray-100" />
          <Skeleton className="mt-4 h-[42px] w-full rounded-lg bg-gray-100" />
        </section>
      </div>

      <section className="px-5 pt-8">
        <Skeleton className="h-7 w-32" />
        <div className="mt-0.5 flex h-[217px] items-end gap-[18px] overflow-hidden pt-[59px]">
          {Array.from({ length: 7 }, (_, index) => (
            <div className="flex w-9 shrink-0 flex-col items-center gap-1.5" key={index}>
              <Skeleton className="h-[134px] w-9 rounded-xl" />
              <Skeleton className="h-[18px] w-7" />
            </div>
          ))}
        </div>
      </section>
    </LoadingRegion>
  );
}
