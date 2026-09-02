"use client";

import { isNativeApp } from "@repo/bridge";
import type { SavingTipSummary } from "@repo/schema/tip";
import { Button } from "@repo/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { type MouseEvent, useState } from "react";
import { openExternalLink } from "@/lib/open-external";
import { savingTipsOptions, toggleSavingTipBookmarkOptions } from "@/lib/queries/tip";

const FILTERS = ["전체", "식비", "생활", "취미"] as const;
type SavingTipFilter = (typeof FILTERS)[number];

function SavingTipCard({
  tip,
  savingPending,
  onToggleSave,
}: {
  tip: SavingTipSummary;
  savingPending: boolean;
  onToggleSave: (tip: SavingTipSummary) => void;
}) {
  function openInNativeApp(event: MouseEvent<HTMLAnchorElement>) {
    if (!isNativeApp()) return;
    event.preventDefault();
    if (tip.sourceUrl) openExternalLink(tip.sourceUrl);
  }

  return (
    <article className="relative flex min-w-0 flex-col gap-1.5 rounded-xl bg-gray-10 p-3.5 transition-[scale] duration-100 has-[:active]:scale-[0.99] motion-reduce:transition-none motion-reduce:has-[:active]:scale-100">
      <div className="flex min-w-0 items-center justify-between gap-2">
        {tip.subcategory ? (
          <span className="min-w-0 truncate rounded bg-blue-100 px-1.5 py-1 text-caption-c1-700 text-blue-600">
            {tip.subcategory}
          </span>
        ) : null}
        <button
          aria-busy={savingPending}
          aria-label={`${tip.title} 저장`}
          aria-pressed={tip.bookmarked}
          className="-m-3 relative z-10 ml-auto flex size-11 shrink-0 items-center justify-center rounded-full transition-[scale,background-color] duration-100 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.92] motion-reduce:transition-none motion-reduce:active:scale-100"
          disabled={savingPending}
          type="button"
          onClick={() => onToggleSave(tip)}
        >
          <Star
            aria-hidden="true"
            className={
              tip.bookmarked
                ? "size-5 fill-success text-success"
                : "size-5 fill-gray-400 text-gray-400"
            }
          />
        </button>
      </div>
      {tip.sourceUrl ? (
        <a
          className="block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring after:absolute after:inset-0"
          href={tip.sourceUrl}
          rel="noopener noreferrer"
          target="_blank"
          onClick={openInNativeApp}
        >
          <TipContent tip={tip} />
        </a>
      ) : (
        <TipContent tip={tip} />
      )}
    </article>
  );
}

function TipContent({ tip }: { tip: SavingTipSummary }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <h2 className="break-words text-body-b1-700 text-gray-900">{tip.title}</h2>
      {tip.description ? (
        <p className="break-words text-body-b2-500 text-gray-900">{tip.description}</p>
      ) : null}
    </div>
  );
}

/** 절약 팁은 서버 목록과 북마크 상태를 함께 받아 기기 간 저장 상태를 일치시킨다. */
export function SavingTipList({ savedOnly = false }: { savedOnly?: boolean }) {
  const [filter, setFilter] = useState<SavingTipFilter>("전체");
  const [pendingTipIds, setPendingTipIds] = useState<readonly number[]>([]);
  const [saveError, setSaveError] = useState<string>();
  const category = savedOnly || filter === "전체" ? null : filter;
  const tipsQuery = useQuery(savingTipsOptions(category));
  const queryClient = useQueryClient();
  const toggleBookmark = useMutation(toggleSavingTipBookmarkOptions());
  const tipQueryKey = savingTipsOptions(null).queryKey.slice(0, 1);
  const tips = (tipsQuery.data ?? []).filter((tip) => !savedOnly || tip.bookmarked);

  function updateCachedBookmark(tipId: number, bookmarked: boolean) {
    queryClient.setQueriesData<readonly SavingTipSummary[]>({ queryKey: tipQueryKey }, (items) =>
      items?.map((tip) => (tip.id === tipId ? { ...tip, bookmarked } : tip)),
    );
  }

  function toggleSave(tip: SavingTipSummary) {
    if (pendingTipIds.includes(tip.id)) return;
    const nextBookmarked = !tip.bookmarked;
    setSaveError(undefined);
    setPendingTipIds((ids) => [...ids, tip.id]);
    updateCachedBookmark(tip.id, nextBookmarked);
    toggleBookmark.mutate(
      { bookmarked: tip.bookmarked, tipId: tip.id },
      {
        onError: () => {
          updateCachedBookmark(tip.id, tip.bookmarked);
          setSaveError("저장 상태를 바꾸지 못했어요. 잠시 후 다시 시도해 주세요.");
        },
        onSettled: () => {
          setPendingTipIds((ids) => ids.filter((id) => id !== tip.id));
          void queryClient.invalidateQueries({ queryKey: tipQueryKey });
        },
      },
    );
  }

  function renderTipCards() {
    if (tipsQuery.isPending) {
      return <p className="py-20 text-center text-body-b2-500 text-gray-500">불러오는 중이에요.</p>;
    }
    if (tipsQuery.isError) {
      return (
        <div className="flex flex-col items-center py-10 text-center">
          <p className="text-body-b2-500 text-gray-500" role="alert">
            절약 팁을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
          </p>
          <Button className="mt-4" size="sm" onClick={() => void tipsQuery.refetch()}>
            다시 시도
          </Button>
        </div>
      );
    }
    if (tips.length === 0) {
      return savedOnly ? (
        <p className="-mt-5 py-20 text-center text-body-b2-500 text-gray-500">
          저장한 절약 팁이 없어요.
          <br />
          관심 있는 팁의 별을 눌러 저장해보세요.
        </p>
      ) : (
        <p className="py-10 text-center text-body-b2-500 text-gray-500">
          해당하는 절약 팁이 없어요.
        </p>
      );
    }
    return tips.map((tip) => (
      <SavingTipCard
        key={tip.id}
        savingPending={pendingTipIds.includes(tip.id)}
        tip={tip}
        onToggleSave={toggleSave}
      />
    ));
  }

  if (savedOnly) {
    return (
      <section aria-label="저장한 절약 팁" className="mt-5 flex flex-col gap-3 px-5">
        {saveError ? (
          <p aria-live="polite" className="text-body-b2-500 text-error">
            {saveError}
          </p>
        ) : null}
        {renderTipCards()}
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
        {saveError ? (
          <p aria-live="polite" className="text-body-b2-500 text-error">
            {saveError}
          </p>
        ) : null}
        {renderTipCards()}
      </section>
    </div>
  );
}
