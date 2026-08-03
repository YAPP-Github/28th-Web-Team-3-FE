import { bridge, isNativeApp } from "@repo/bridge";
import { Star } from "lucide-react";
import type { MouseEvent } from "react";
import { BENEFIT_ITEM_CATEGORY_LABELS } from "@/app/(tabs)/benefits/constants";
import type { Benefit } from "@/app/(tabs)/benefits/types";

interface BenefitCardProps {
  benefit: Benefit;
  saved: boolean;
  onToggleSave: (id: string) => void;
}

/**
 * 정책 카드 — 카드 전체가 공식 페이지로 가는 링크다.
 * WebView 안에서는 bridge.openExternal로 네이티브에 위임하고(window.open·target="_blank"가
 * WebView에서 통하지 않는다), 일반 브라우저에서는 새 탭으로 연다.
 *
 * 링크는 제목에만 걸고 `after:inset-0`으로 카드 전체를 덮는다. 카드를 `<a>`로 감싸면
 * 저장 버튼이 링크 안에 들어가 중첩 인터랙티브가 되고, 스크린리더도 버튼을 링크 이름의
 * 일부로 읽는다.
 */
export function BenefitCard({ benefit, saved, onToggleSave }: BenefitCardProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!isNativeApp()) return;
    event.preventDefault();
    // 웹 브릿지는 throwOnError:true라 실패 시 reject된다 — 삼켜서 unhandled rejection을 막는다.
    bridge.openExternal(benefit.officialUrl).catch(() => {});
  }

  return (
    <article className="relative flex flex-col gap-1.5 rounded-xl bg-gray-10 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center rounded bg-blue-100 px-1.5 py-1 text-caption-c1-700 text-blue-600">
          {BENEFIT_ITEM_CATEGORY_LABELS[benefit.category]}
        </span>
        <button
          type="button"
          aria-pressed={saved}
          aria-label={`${benefit.title} 저장`}
          onClick={() => onToggleSave(benefit.id)}
          // 링크 덮개(after:inset-0) 위로 올려야 클릭이 버튼에 닿는다.
          className="-m-1 relative z-10 p-1"
        >
          <Star
            aria-hidden="true"
            className={saved ? "size-5 fill-primary text-primary" : "size-5 text-gray-300"}
          />
        </button>
      </div>
      <div className="flex flex-col gap-1">
        <a
          href={benefit.officialUrl}
          target="_blank"
          rel="noreferrer noopener"
          onClick={handleClick}
          className="text-body-b1-700 text-gray-900 after:absolute after:inset-0"
        >
          {benefit.title}
        </a>
        <p className="text-body-b2-500 text-gray-900">{benefit.summary}</p>
        {/* 디자인에 없는 줄이다. 지원 대상은 혜택 화면의 핵심 정보라 남긴다. */}
        <p className="text-caption-c1-500 text-gray-400">{benefit.condition}</p>
      </div>
    </article>
  );
}
