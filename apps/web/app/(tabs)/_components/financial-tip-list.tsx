import type { FinancialTip } from "@/app/(tabs)/constants/home";
import { SectionHeader } from "./section-header";

interface FinancialTipListProps {
  tips: readonly FinancialTip[];
}

export function FinancialTipList({ tips }: FinancialTipListProps) {
  return (
    <section className="flex flex-col gap-4 pt-8">
      <div className="px-5">
        <SectionHeader title="재테크 선배의 팁" />
      </div>
      <div className="overflow-x-auto px-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-3 pb-1">
          {tips.map((tip) => (
            <article
              key={tip.id}
              className="flex w-50 flex-col items-start gap-3 rounded-2xl border border-gray-200 bg-gray-0 p-4"
            >
              <span className="rounded bg-blue-100 px-1.5 py-1 text-caption-c1-700 text-blue-600">
                {tip.category}
              </span>
              <h3 className="text-body-b1-700 text-gray-900">{tip.title}</h3>
              <p className="text-body-b2-500 text-gray-600">{tip.summary}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
