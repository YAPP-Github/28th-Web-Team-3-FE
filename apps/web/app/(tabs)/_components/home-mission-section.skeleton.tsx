import { Skeleton } from "@repo/ui";
import { HomeMissionCardSkeleton } from "./home-mission-card.skeleton";

const HOME_MISSION_SKELETONS = ["first", "second", "third"] as const;
const HOME_MISSION_FILTER_SKELETONS = ["all", "meal", "living", "hobby"] as const;

/** 홈의 주간 미션 요약, 필터, 접힌 카드 목록 자리를 함께 유지한다. */
export function HomeMissionSectionSkeleton() {
  return (
    <section className="flex flex-col px-5">
      <div className="relative h-[130px]">
        <header className="flex h-8 items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-24 bg-gray-100" />
            <Skeleton className="h-6 w-12 bg-gray-100" />
          </div>
          <Skeleton className="size-5 bg-gray-100" />
        </header>
        <div className="absolute top-12 left-0 flex flex-col gap-2">
          <Skeleton className="h-7 w-20 bg-gray-100" />
          <Skeleton className="h-5 w-32 bg-gray-100" />
        </div>
        <Skeleton className="absolute top-0 right-0 size-[116px] rounded-full bg-gray-100" />
      </div>

      <div className="flex flex-col gap-4 pt-3">
        <div className="flex gap-1.5">
          {HOME_MISSION_FILTER_SKELETONS.map((filter) => (
            <Skeleton className="h-[34px] w-14 rounded-lg bg-gray-100" key={filter} />
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {HOME_MISSION_SKELETONS.map((mission) => (
            <HomeMissionCardSkeleton key={mission} />
          ))}
        </div>
      </div>
    </section>
  );
}
