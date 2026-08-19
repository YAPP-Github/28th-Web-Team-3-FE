import { Skeleton } from "@repo/ui";

/** 홈의 접힌 미션 카드와 같은 한 줄 높이를 유지한다. */
export function HomeMissionCardSkeleton() {
  return (
    <article className="flex items-center gap-2 rounded-xl bg-gray-10 p-3.5">
      <Skeleton className="size-5 shrink-0 rounded-full bg-gray-100" />
      <Skeleton className="h-5 flex-1 bg-gray-100" />
      <Skeleton className="size-5 shrink-0 bg-gray-100" />
    </article>
  );
}
