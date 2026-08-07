import { isNativeApp } from "@repo/bridge";
import type { MouseEvent } from "react";
import { BENEFITS } from "@/app/(tabs)/benefits/constants";
import type { FinancialTip } from "@/app/(tabs)/benefits/types";
import { openExternalLink } from "@/lib/open-external";
import { SectionHeader } from "./section-header";

interface FinancialTipListProps {
  tips: readonly FinancialTip[];
}

const CARD_CLASS =
  "flex w-50 flex-col items-start gap-3 rounded-2xl border border-gray-200 bg-gray-0 p-4";

/** 팁이 소개하는 정책의 공식 URL — 팁과 정책은 같은 id를 쓴다. 정책이 없는 팁은 링크가 없다. */
function findOfficialUrl(tipId: string): string | undefined {
  return BENEFITS.find((benefit) => benefit.id === tipId)?.officialUrl;
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
            <TipCard key={tip.id} tip={tip} />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * 팁 카드 — 대응하는 정책이 있으면 카드 전체가 공식 페이지로 가는 링크다(혜택 탭 카드와 같은 동작).
 * WebView 안에서는 bridge.openExternal로 네이티브에 위임하고(window.open·target="_blank"가
 * WebView에서 통하지 않는다), 일반 브라우저에서는 새 탭으로 연다.
 */
function TipCard({ tip }: { tip: FinancialTip }) {
  const officialUrl = findOfficialUrl(tip.id);

  const content = (
    <>
      <span className="rounded bg-blue-100 px-1.5 py-1 text-caption-c1-700 text-blue-600">
        {tip.category}
      </span>
      <h3 className="text-body-b1-700 text-gray-900">{tip.title}</h3>
      <p className="text-body-b2-500 text-gray-600">{tip.summary}</p>
    </>
  );

  if (!officialUrl) {
    return <article className={CARD_CLASS}>{content}</article>;
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    // 브라우저에서는 `<a target="_blank">` 기본 동작에 맡긴다.
    if (!isNativeApp() || !officialUrl) return;
    event.preventDefault();
    openExternalLink(officialUrl);
  }

  return (
    <a
      href={officialUrl}
      target="_blank"
      rel="noreferrer noopener"
      onClick={handleClick}
      className={CARD_CLASS}
    >
      {content}
    </a>
  );
}
