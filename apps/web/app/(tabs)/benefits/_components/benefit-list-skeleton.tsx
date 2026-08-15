import { Skeleton } from "@repo/ui";
import { LoadingRegion } from "@/app/_components/loading-region";

const CARD_SKELETONS = ["first", "second", "third"];

/** 카테고리 전환 중 실제 혜택 카드가 들어올 자리를 유지한다. */
export function BenefitListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <LoadingRegion label="혜택 목록을 불러오는 중">
      <div className="flex flex-col gap-3">
        {CARD_SKELETONS.slice(0, count).map((card) => (
          <div
            key={card}
            data-slot="benefit-card-skeleton"
            className="flex flex-col gap-3 rounded-xl bg-gray-10 p-3.5"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-14 bg-gray-100" />
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
