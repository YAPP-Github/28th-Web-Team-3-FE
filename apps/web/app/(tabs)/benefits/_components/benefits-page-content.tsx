"use client";

import BenefitHero from "@repo/ui/svg/benefit-hero.svg";
import Link from "next/link";
import { Suspense, useState } from "react";
import { SAFE_AREA_HERO_ATTRIBUTE } from "@/lib/safe-area-bands";
import type { BenefitContentType } from "../types";
import { BenefitsExplorer } from "./benefits-explorer";

const FILTER_SKELETONS = ["all", "finance", "housing", "welfare", "education"];
const CARD_SKELETONS = ["first", "second", "third"];

function BenefitsExplorerSkeleton() {
  return (
    <section aria-busy="true" aria-label="혜택 목록">
      <span role="status" className="sr-only">
        혜택 목록을 불러오고 있어요.
      </span>
      <div className="border-gray-100 border-b pt-2.5">
        <div className="mx-auto flex h-11 w-[335px] max-w-full">
          <div className="flex-1 border-gray-800 border-b-2" />
          <div className="flex-1" />
        </div>
      </div>
      <div className="mt-[23px] flex gap-1.5 overflow-hidden px-5">
        {FILTER_SKELETONS.map((filter) => (
          <div
            key={filter}
            className="h-9 w-16 shrink-0 animate-pulse rounded-lg bg-gray-50 motion-reduce:animate-none"
          />
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-3 px-5">
        {CARD_SKELETONS.map((card) => (
          <div
            key={card}
            className="h-28 animate-pulse rounded-xl bg-gray-50 motion-reduce:animate-none"
          />
        ))}
      </div>
    </section>
  );
}

/** 탭 상태를 히어로와 목록이 함께 쓴다. 정책 탭의 안내 문구를 절약 팁으로 바꾸지 않는다. */
export function BenefitsPageContent() {
  const [contentType, setContentType] = useState<BenefitContentType>("policy");
  const isTipTab = contentType === "tip";

  return (
    <main className="flex flex-1 flex-col overflow-x-clip bg-gray-0">
      <section {...{ [SAFE_AREA_HERO_ATTRIBUTE]: "" }} className="bg-blue-50 px-5 pb-[39px]">
        <div className="flex items-center justify-between gap-2 py-2">
          <h1 className="text-title-t1-700 text-gray-900">혜택/팁</h1>
          <Link
            className="-mr-2.5 flex h-11 items-center rounded-sm px-2.5 text-body-b1-500 text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href="/benefits/saved"
          >
            저장됨
          </Link>
        </div>
        <div className="mt-[22px] flex items-start justify-between gap-2">
          <p className="shrink-0 text-headline-h2-700 text-gray-900">
            {isTipTab ? (
              <>
                지금 바로 챙기면
                <br />
                좋은 절약 팁
              </>
            ) : (
              <>
                지금 바로 신청하기
                <br />
                좋은 혜택
              </>
            )}
          </p>
          <BenefitHero
            aria-hidden="true"
            className="h-auto w-[148px] min-w-0"
            data-slot="benefit-hero-illustration"
          />
        </div>
      </section>
      <Suspense fallback={<BenefitsExplorerSkeleton />}>
        <BenefitsExplorer contentType={contentType} onContentTypeChange={setContentType} />
      </Suspense>
    </main>
  );
}
