"use client";

import { isNativeApp } from "@repo/bridge";
import { Star } from "lucide-react";
import { type MouseEvent, useEffect, useState } from "react";
import { SAVING_TIPS } from "@/app/(tabs)/benefits/constants";
import type { SavingTip } from "@/app/(tabs)/benefits/types";
import {
  getSavedSavingTipIds,
  removeSavingTip,
  saveSavingTip,
} from "@/app/(tabs)/benefits/utils/saving-tip-bookmarks";
import { openExternalLink } from "@/lib/open-external";

const FILTERS = ["전체", "식비", "생활", "취미"] as const;
type SavingTipFilter = (typeof FILTERS)[number];

function SavingTipCard({
  tip,
  saved,
  savingReady,
  savingPending,
  onToggleSave,
}: {
  tip: SavingTip;
  saved: boolean;
  savingReady: boolean;
  savingPending: boolean;
  onToggleSave: (tipId: string) => void;
}) {
  function openInNativeApp(event: MouseEvent<HTMLAnchorElement>) {
    if (!isNativeApp()) return;
    event.preventDefault();
    openExternalLink(tip.url);
  }

  return (
    <article className="relative flex min-w-0 flex-col gap-1.5 rounded-xl bg-gray-10 p-3.5 transition-[scale] duration-100 has-[:active]:scale-[0.99] motion-reduce:transition-none motion-reduce:has-[:active]:scale-100">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <span className="min-w-0 truncate rounded bg-blue-100 px-1.5 py-1 text-caption-c1-700 text-blue-600">
          {tip.selection}
        </span>
        <button
          aria-label={`${tip.title} 저장`}
          aria-pressed={saved}
          aria-busy={!savingReady || savingPending}
          className="-m-3 relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full transition-[scale,background-color] duration-100 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.92] motion-reduce:transition-none motion-reduce:active:scale-100"
          type="button"
          onClick={() => {
            if (savingReady && !savingPending) onToggleSave(tip.id);
          }}
        >
          <Star
            aria-hidden="true"
            className={
              saved ? "size-5 fill-success text-success" : "size-5 fill-gray-400 text-gray-400"
            }
          />
        </button>
      </div>
      <a
        className="block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring after:absolute after:inset-0"
        href={tip.url}
        rel="noopener noreferrer"
        target="_blank"
        onClick={openInNativeApp}
      >
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="break-words text-body-b1-700 text-gray-900">{tip.title}</h2>
          <p className="break-words text-body-b2-500 text-gray-900">{tip.ragText}</p>
        </div>
      </a>
    </article>
  );
}

/** 정적 절약 팁은 화면에서만 분류한다. API 요청과 페이지네이션은 필요 없다. */
export function SavingTipList({ savedOnly = false }: { savedOnly?: boolean }) {
  const [filter, setFilter] = useState<SavingTipFilter>("전체");
  const [savedTipIds, setSavedTipIds] = useState<readonly string[]>([]);
  const [isLoadingSavedTips, setIsLoadingSavedTips] = useState(true);
  const [pendingTipIds, setPendingTipIds] = useState<readonly string[]>([]);
  const [saveError, setSaveError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    void getSavedSavingTipIds().then((ids) => {
      if (!cancelled) {
        setSavedTipIds(ids);
        setIsLoadingSavedTips(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const tips = SAVING_TIPS.filter((tip) => {
    if (savedOnly && !savedTipIds.includes(tip.id)) return false;
    return filter === "전체" || tip.category === filter;
  });

  async function toggleSave(tipId: string) {
    if (pendingTipIds.includes(tipId)) return;
    const wasSaved = savedTipIds.includes(tipId);
    setSaveError(undefined);
    setPendingTipIds((ids) => [...ids, tipId]);
    setSavedTipIds((ids) => (wasSaved ? ids.filter((id) => id !== tipId) : [...ids, tipId]));
    const saved = wasSaved ? await removeSavingTip(tipId) : await saveSavingTip(tipId);
    if (!saved) {
      setSavedTipIds((ids) => (wasSaved ? [...ids, tipId] : ids.filter((id) => id !== tipId)));
      setSaveError("저장 상태를 바꾸지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
    setPendingTipIds((ids) => ids.filter((id) => id !== tipId));
  }

  function renderTipCards() {
    return (
      <>
        {saveError ? (
          <p aria-live="polite" className="text-body-b2-500 text-error">
            {saveError}
          </p>
        ) : null}
        {tipCards}
      </>
    );
  }

  const tipCards = tips.map((tip) => (
    <SavingTipCard
      key={tip.id}
      saved={savedTipIds.includes(tip.id)}
      savingPending={pendingTipIds.includes(tip.id)}
      savingReady={!isLoadingSavedTips}
      tip={tip}
      onToggleSave={(tipId) => void toggleSave(tipId)}
    />
  ));

  if (savedOnly) {
    return (
      <section aria-label="저장한 절약 팁" className="mt-5 flex flex-col gap-3 px-5">
        {isLoadingSavedTips ? (
          <p className="py-20 text-center text-body-b2-500 text-gray-500">불러오는 중이에요.</p>
        ) : tips.length === 0 ? (
          <p className="py-20 text-center text-body-b2-500 text-gray-500">
            저장한 절약 팁이 없어요.
            <br />
            관심 있는 팁의 별을 눌러 저장해보세요.
          </p>
        ) : (
          renderTipCards()
        )}
      </section>
    );
  }

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
        {renderTipCards()}
      </section>
    </div>
  );
}
