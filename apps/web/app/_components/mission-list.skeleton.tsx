import { Skeleton } from "@repo/ui";
import { LoadingRegion } from "./loading-region";

interface MissionListSkeletonProps {
  count?: number;
  className?: string;
  label?: string;
}

/** 미션 생성 결과처럼 상세 카드의 모양을 아직 알 수 없는 목록 대기 화면. */
export function MissionListSkeleton({ count = 3, className, label }: MissionListSkeletonProps) {
  const rows = Array.from({ length: count }, (_, index) => `mission-skeleton-${index}`);

  return (
    <LoadingRegion className={className} label={label}>
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row} className="flex flex-col gap-3 rounded-2xl bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-16 rounded-full bg-gray-100" />
              <Skeleton className="size-5 bg-gray-100" />
            </div>
            <Skeleton className="h-6 w-3/4 bg-gray-100" />
            <Skeleton className="h-5 w-1/2 bg-gray-100" />
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}
