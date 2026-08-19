import { Skeleton } from "@repo/ui";
import { LoadingRegion } from "@/app/_components/loading-region";
import { MissionCardSkeleton } from "./mission-card.skeleton";

const MISSION_CARD_SKELETONS = ["first", "second", "third", "fourth"] as const;
const MISSION_CATEGORY_SKELETONS = ["all", "meal", "living", "hobby"] as const;

/** 미션 히어로, 카테고리, 접힌 카드 목록의 첫 화면 구조를 유지한다. */
export function MissionPageSkeleton() {
  return (
    <LoadingRegion className="flex flex-1" label="미션을 불러오는 중">
      <main className="flex flex-1 flex-col bg-gray-0 text-gray-900">
        <section
          className="relative flex h-[225px] shrink-0 flex-col gap-6 overflow-hidden bg-gray-50 px-5"
          data-slot="mission-hero-skeleton"
        >
          <div className="flex h-11 shrink-0 items-center justify-between">
            <Skeleton className="h-7 w-12 bg-gray-100" />
            <Skeleton className="h-11 w-11 rounded-full bg-gray-100" />
          </div>
          <div className="flex flex-col items-start gap-3">
            <Skeleton className="h-6 w-12 bg-gray-100" />
            <Skeleton className="h-9 w-20 bg-gray-100" />
            <Skeleton className="h-5 w-36 bg-gray-100" />
          </div>
          <Skeleton className="absolute top-[66px] right-[33px] size-[116px] rounded-full bg-gray-100" />
        </section>

        <section className="flex flex-col gap-5 px-5 pt-6">
          <div className="flex gap-1.5">
            {MISSION_CATEGORY_SKELETONS.map((category) => (
              <Skeleton className="h-[34px] w-14 rounded-lg bg-gray-50" key={category} />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-14 bg-gray-50" />
            {MISSION_CARD_SKELETONS.map((mission) => (
              <MissionCardSkeleton key={mission} />
            ))}
          </div>
        </section>
      </main>
    </LoadingRegion>
  );
}
