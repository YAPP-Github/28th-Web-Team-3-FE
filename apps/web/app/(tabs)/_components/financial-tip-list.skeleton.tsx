import { Skeleton } from "@repo/ui";

const POLICY_SKELETONS = ["first", "second"] as const;

/** 홈 혜택/팁 가로 카드 목록의 크기와 스크롤 시작 위치를 유지한다. */
export function FinancialTipListSkeleton() {
  return (
    <section className="flex flex-col gap-4 border-t-[12px] border-gray-50 pt-8">
      <div className="px-5">
        <Skeleton className="h-7 w-48 bg-gray-50" />
      </div>
      <div className="overflow-x-auto px-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-3 pb-1">
          {POLICY_SKELETONS.map((policy) => (
            <Skeleton className="h-[143px] w-50 rounded-2xl bg-gray-50" key={policy} />
          ))}
        </div>
      </div>
    </section>
  );
}
