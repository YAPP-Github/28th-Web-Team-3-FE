import { Skeleton } from "@repo/ui";
import { LoadingRegion } from "@/app/_components/loading-region";

interface HomeGoalSectionSkeletonProps {
  label?: string;
}

/** 홈 목표 현황의 실제 제목 행과 월간 목표 카드 높이를 유지한다. */
export function HomeGoalSectionSkeleton({ label }: HomeGoalSectionSkeletonProps) {
  return (
    <LoadingRegion className="flex flex-col gap-4" label={label}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Skeleton className="h-6.25 w-8 shrink-0" />
          <Skeleton className="h-7 w-40" />
        </span>
        <Skeleton className="size-5 shrink-0" />
      </div>

      <section className="flex flex-col rounded-2xl bg-gray-50 p-4">
        <div className="flex items-start justify-between">
          <Skeleton className="h-6 w-28 bg-gray-100" />
          <Skeleton className="h-7 w-12 bg-gray-100" />
        </div>
        <Skeleton className="mt-3 h-9 w-36 bg-gray-100" />
        <Skeleton className="mt-3 h-4 w-full rounded-full bg-gray-100" />
        <Skeleton className="mt-4 h-[42px] w-full rounded-lg bg-gray-100" />
      </section>
    </LoadingRegion>
  );
}
