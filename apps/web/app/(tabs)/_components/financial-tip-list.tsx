"use client";

import type { PolicySummary } from "@repo/schema/policy";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { HOME_POLICY_COUNT, homePoliciesOptions } from "@/lib/queries/policy";
import { SectionHeader } from "./section-header";

const CARD_CLASS =
  "flex h-[143px] w-50 flex-col items-start gap-2 rounded-2xl border-[1.5px] border-gray-200 bg-gray-0 p-4";

export function FinancialTipList() {
  const { data: policies, isPending, isError } = useQuery(homePoliciesOptions());

  return (
    <section className="flex flex-col gap-4 border-t-[12px] border-gray-50 pt-8">
      <div className="px-5">
        <SectionHeader title="눈여겨볼 만한 혜택/팁" />
      </div>
      <div className="overflow-x-auto px-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-3 pb-1">
          {isPending
            ? Array.from({ length: 2 }, (_, index) => (
                <div
                  key={index}
                  aria-hidden="true"
                  className={`${CARD_CLASS} animate-pulse bg-gray-50`}
                />
              ))
            : policies
                ?.slice(0, HOME_POLICY_COUNT)
                .map((policy) => <PolicyTipCard key={policy.id} policy={policy} />)}
        </div>
      </div>
      {isError && !policies ? (
        <p className="px-5 text-body-b2-500 text-gray-500">
          혜택을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      ) : null}
    </section>
  );
}

function PolicyTipCard({ policy }: { policy: PolicySummary }) {
  const categoryLabel = policy.category ?? policy.largeCategory ?? "정부 정책";
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [isTitleMultiline, setIsTitleMultiline] = useState(false);

  useLayoutEffect(() => {
    const title = titleRef.current;
    if (!title) return;

    const updateTitleLines = () => {
      const lineHeight = Number.parseFloat(window.getComputedStyle(title).lineHeight);
      setIsTitleMultiline(
        Number.isFinite(lineHeight) && title.getBoundingClientRect().height > lineHeight,
      );
    };

    updateTitleLines();

    if (typeof ResizeObserver === "undefined") return;

    const resizeObserver = new ResizeObserver(updateTitleLines);
    resizeObserver.observe(title);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <Link className={CARD_CLASS} href="/benefits">
      <span className="max-w-full truncate rounded bg-blue-100 px-1.5 py-1 text-caption-c1-700 text-blue-600">
        {categoryLabel}
      </span>
      <h3 ref={titleRef} className="line-clamp-2 text-body-b1-700 text-blue-900">
        {policy.title}
      </h3>
      <p
        className={`${isTitleMultiline ? "line-clamp-1" : "line-clamp-2"} text-body-b2-500 text-gray-700`}
      >
        {policy.description ?? "자세한 혜택 내용을 확인해 보세요."}
      </p>
    </Link>
  );
}
