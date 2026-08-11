"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useSavedToggleQueue } from "@/app/(tabs)/benefits/_hooks/use-saved-toggle-queue";
import { toBenefitItem, toSavedBenefitItem } from "@/app/(tabs)/benefits/lib/benefit-items";
import { getBenefitFilterCategory } from "@/app/(tabs)/benefits/lib/filter-benefits";
import { getBenefitFilterHref } from "@/app/(tabs)/benefits/lib/filter-href";
import type { BenefitFilter, BenefitItem } from "@/app/(tabs)/benefits/types";
import { savedPoliciesOptions } from "@/lib/queries/bookmark";
import { policiesOptions, togglePolicyBookmarkOptions } from "@/lib/queries/policy";
import { BenefitCard } from "./benefit-card";
import { BenefitFilters } from "./benefit-filters";

/**
 * 필터 칩 + 혜택 목록. 필터링·페이지네이션은 서버(`/api/policies`)가 하고, "저장" 칩만
 * 저장 목록(`/api/bookmarks`)이라 다른 쿼리를 탄다. URL은 history.replaceState로만
 * 동기화해(서버 재렌더 없음) 공유·딥링크는 유지하되 전환은 끊김 없이 반영된다.
 * 초기 필터는 서버 페이지가 searchParams로 읽어 넘겨준다.
 */
export function BenefitsExplorer({ initialFilter }: { initialFilter: BenefitFilter }) {
  const [filter, setFilter] = useState(initialFilter);
  const queryClient = useQueryClient();
  const toggleBookmark = useMutation(togglePolicyBookmarkOptions());
  // 언제 보낼지와 그동안 화면을 어떻게 보일지는 큐가 맡는다 — mutation 자체는 여기서 만든다.
  const { saveError, clearSaveError, toggleSaved } = useSavedToggleQueue(
    queryClient,
    toggleBookmark.mutate,
  );
  const isSavedFilter = filter === "saved";

  const policies = useInfiniteQuery({
    ...policiesOptions(getBenefitFilterCategory(filter)),
    enabled: !isSavedFilter,
  });
  const saved = useQuery({ ...savedPoliciesOptions(), enabled: isSavedFilter });

  const benefits: readonly BenefitItem[] = isSavedFilter
    ? (saved.data ?? []).map(toSavedBenefitItem)
    : (policies.data?.pages.flat() ?? []).map(toBenefitItem);
  const isPending = isSavedFilter ? saved.isPending : policies.isPending;
  const isError = isSavedFilter ? saved.isError : policies.isError;

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = policies;
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 목록 끝이 보이면 다음 페이지를 당긴다. 스크롤 이벤트로 위치를 재면 매 프레임 레이아웃을
  // 읽어야 하지만, observer는 브라우저가 교차 시점만 알려준다.
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) fetchNextPage();
      },
      // 목록 끝에 닿기 한 화면 전에 미리 당긴다 — 정확히 바닥에서 시작하면 스크롤이 한 번 멈춘다.
      { rootMargin: "400px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  function selectFilter(next: BenefitFilter) {
    setFilter(next);
    clearSaveError();
    window.history.replaceState(null, "", getBenefitFilterHref(next));
  }

  return (
    <>
      <h2 className="mt-[17px] px-5 text-title-t2-700 text-gray-900">맞춤 추천 혜택</h2>
      <div className="mt-[18px]">
        <BenefitFilters selected={filter} onSelect={selectFilter} />
      </div>
      {/*
        칩을 눌러도 초점은 칩에 남으므로 결과가 바뀐 것을 따로 알린다. 목록 자체를 live
        region으로 만들면 안 된다 — 카드가 빠지기만 하는 변경은 안 읽히고, 카테고리를 바꾸면
        추가된 카드의 제목·설명·버튼이 통째로 읽히며, 별 버튼의 aria-pressed 변화까지
        region 안에서 일어난다. 짧은 상태 문구만 따로 둔다(W3C ARIA22).
      */}
      {/*
        개수는 싣지 않는다 — 무한 스크롤로 목록이 늘 때마다 문구가 바뀌어 "20개를 찾았어요",
        "40개를 찾았어요"가 스크롤 내내 읽힌다. 칩을 바꿔 결과 유무가 달라질 때만 바뀌게 둔다.
      */}
      <p role="status" className="sr-only">
        {isPending || isError
          ? ""
          : benefits.length > 0
            ? "혜택 목록을 불러왔어요."
            : "조건에 맞는 혜택이 없어요."}
      </p>
      <section id="benefits-list" aria-label="정책 목록" className="mt-5 flex flex-col gap-3 px-5">
        {saveError ? (
          <p aria-live="polite" className="text-body-b2-500 text-error">
            {saveError}
          </p>
        ) : null}
        {isPending ? (
          <p className="py-10 text-center text-body-b2-500 text-gray-400">불러오는 중…</p>
        ) : isError ? (
          // 칩을 눌러 실패했을 때 초점은 칩에 남는다 — alert로 알려야 화면 밖 사용자도 안다.
          <p role="alert" className="py-10 text-center text-body-b2-500 text-gray-500">
            혜택을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
          </p>
        ) : benefits.length === 0 ? (
          <p className="py-10 text-center text-body-b2-500 text-gray-500">
            {isSavedFilter ? (
              <>
                저장한 혜택이 없어요.
                <br />
                관심 있는 혜택의 별을 눌러 저장해보세요.
              </>
            ) : (
              "해당하는 혜택이 없어요."
            )}
          </p>
        ) : (
          benefits.map((benefit) => (
            <BenefitCard key={benefit.id} benefit={benefit} onToggleSave={toggleSaved} />
          ))
        )}
        {/* 다음 페이지 감지용. 저장 목록은 한 번에 다 오므로 목록 쿼리일 때만 둔다. */}
        {!isSavedFilter && hasNextPage ? <div ref={loadMoreRef} aria-hidden="true" /> : null}
      </section>
    </>
  );
}
