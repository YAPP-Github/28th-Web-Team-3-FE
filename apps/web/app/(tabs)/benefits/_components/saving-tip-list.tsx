"use client";

import { isNativeApp } from "@repo/bridge";
import { ExternalLink } from "lucide-react";
import { type MouseEvent, useState } from "react";
import { SAVING_TIPS } from "@/app/(tabs)/benefits/constants";
import type { SavingTip } from "@/app/(tabs)/benefits/types";
import { openExternalLink } from "@/lib/open-external";

const FILTERS = ["전체", "식비", "생활", "취미"] as const;
type SavingTipFilter = (typeof FILTERS)[number];

function SavingTipCard({ tip }: { tip: SavingTip }) {
  function openInNativeApp(event: MouseEvent<HTMLAnchorElement>) {
    if (!isNativeApp()) return;
    event.preventDefault();
    openExternalLink(tip.url);
  }

  return (
    <article className="min-w-0 rounded-xl bg-gray-10 p-3.5 transition-[scale] duration-100 has-[:active]:scale-[0.99] motion-reduce:transition-none motion-reduce:has-[:active]:scale-100">
      <a
        className="block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        href={tip.url}
        rel="noopener noreferrer"
        target="_blank"
        onClick={openInNativeApp}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-flex rounded bg-blue-100 px-1.5 py-1 text-caption-c1-700 text-blue-600">
              {tip.selection}
            </span>
            <h2 className="mt-2 break-words text-body-b1-700 text-gray-900">{tip.title}</h2>
          </div>
          <ExternalLink aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gray-400" />
        </div>
        <p className="mt-1.5 break-words text-body-b2-500 text-gray-600">{tip.ragText}</p>
      </a>
    </article>
  );
}

/** 정적 절약 팁은 화면에서만 분류한다. API 요청과 페이지네이션은 필요 없다. */
export function SavingTipList() {
  const [filter, setFilter] = useState<SavingTipFilter>("전체");
  const tips =
    filter === "전체" ? SAVING_TIPS : SAVING_TIPS.filter((tip) => tip.category === filter);

  return (
    <div>
      <nav
        aria-label="절약 팁 필터"
        className="mt-[23px] overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex min-w-max gap-1.5 px-5">
          {FILTERS.map((value) => {
            const selected = filter === value;
            return (
              <li key={value}>
                <button
                  aria-pressed={selected}
                  className={`inline-flex items-center whitespace-nowrap rounded-lg px-4 py-1.5 text-body-b2-700 transition-[scale,background-color,color] duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 ${
                    selected
                      ? "bg-gray-800 text-gray-0 hover:bg-gray-700"
                      : "bg-gray-50 text-gray-300 hover:bg-gray-100 hover:text-gray-400"
                  }`}
                  type="button"
                  onClick={() => setFilter(value)}
                >
                  {value}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <section aria-label="절약 팁 목록" className="mt-5 flex flex-col gap-3 px-5">
        {tips.map((tip) => (
          <SavingTipCard key={tip.id} tip={tip} />
        ))}
      </section>
    </div>
  );
}
