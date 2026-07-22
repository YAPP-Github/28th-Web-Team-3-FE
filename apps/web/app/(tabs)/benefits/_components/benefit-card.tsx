"use client";

import { bridge, isNativeApp } from "@repo/bridge";
import { ChevronRight, UserRound } from "lucide-react";
import type { MouseEvent } from "react";
import { BENEFIT_ITEM_CATEGORY_LABELS } from "@/app/(tabs)/benefits/constants";
import type { Benefit } from "@/app/(tabs)/benefits/types";

/**
 * 정책 카드 — 카드 전체가 공식 페이지로 가는 링크다 (UT 대응 가안).
 * WebView 안에서는 bridge.openExternal로 네이티브에 위임하고(window.open·target="_blank"가
 * WebView에서 통하지 않는다), 일반 브라우저에서는 새 탭으로 연다.
 */
export function BenefitCard({ benefit }: { benefit: Benefit }) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!isNativeApp()) return;
    event.preventDefault();
    // 웹 브릿지는 throwOnError:true라 실패 시 reject된다 — 삼켜서 unhandled rejection을 막는다.
    bridge.openExternal(benefit.officialUrl).catch(() => {});
  }

  return (
    <a
      href={benefit.officialUrl}
      target="_blank"
      rel="noreferrer noopener"
      onClick={handleClick}
      className="flex items-start gap-3 rounded-[16px] border border-gray-100 bg-gray-0 p-4"
    >
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="inline-flex h-5 w-fit items-center rounded-md bg-blue-50 px-1.5 text-caption-c1-500 text-blue-600">
          {BENEFIT_ITEM_CATEGORY_LABELS[benefit.category]}
        </span>
        <span className="text-body-b1-700 text-gray-900">{benefit.title}</span>
        <span className="text-body-b2-400 text-gray-600">{benefit.summary}</span>
        <span className="mt-0.5 flex items-start gap-1 text-caption-c1-500 text-gray-400">
          <UserRound aria-hidden="true" className="mt-px size-3.5 shrink-0" />
          {benefit.condition}
        </span>
      </span>
      <ChevronRight aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-gray-300" />
    </a>
  );
}
