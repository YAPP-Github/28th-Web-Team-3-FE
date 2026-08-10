import { Skeleton } from "@repo/ui";

interface MissionListSkeletonProps {
  /** 몇 장을 깔지. 홈은 짧게, 미션 탭은 목록 길이에 가깝게. */
  count?: number;
  className?: string;
}

/**
 * 미션 카드 목록의 대기 화면. 홈의 "이번 주 미션"과 미션 탭이 같은 카드를 쓰므로 함께 쓴다.
 *
 * 개수를 실제와 맞출 수는 없다 — 조회 전에는 몇 개인지 모른다. 그래도 문구 한 줄보다는
 * 도착 후 밀림이 훨씬 작다.
 */
export function MissionListSkeleton({ count = 3, className }: MissionListSkeletonProps) {
  // 자리표시자는 순서 말고 정체성이 없다. 인덱스를 그대로 key로 쓰지 않으려고 미리 만든다.
  const rows = Array.from({ length: count }, (_, index) => `mission-skeleton-${index}`);

  return (
    <div aria-busy="true" aria-label="미션을 불러오는 중" className={className} role="status">
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
    </div>
  );
}
