import { Skeleton } from "@repo/ui";

/** 미션 탭의 접힌 진행 중 카드와 같은 높이를 유지한다. */
export function MissionCardSkeleton() {
  return (
    <article className="flex items-center gap-2 rounded-xl bg-gray-10 px-3.5 py-[14px]">
      <Skeleton className="size-5 shrink-0 rounded-full bg-gray-100" />
      <Skeleton className="h-5 flex-1 bg-gray-100" />
      <Skeleton className="size-5 shrink-0 bg-gray-100" />
    </article>
  );
}
