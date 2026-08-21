"use client";

import { Button } from "@repo/ui";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSavedToggleQueue } from "@/app/(tabs)/benefits/_hooks/use-saved-toggle-queue";
import { toBenefitItem } from "@/app/(tabs)/benefits/lib/benefit-items";
import {
  getBenefitFilterCategory,
  parseBenefitFilter,
} from "@/app/(tabs)/benefits/lib/filter-benefits";
import { getBenefitFilterHref } from "@/app/(tabs)/benefits/lib/filter-href";
import type { BenefitContentType, BenefitFilter, BenefitItem } from "@/app/(tabs)/benefits/types";
import { policiesOptions, togglePolicyBookmarkOptions } from "@/lib/queries/policy";
import { BenefitCard } from "./benefit-card";
import { BenefitFilters } from "./benefit-filters";
import { BenefitListSkeleton } from "./benefit-list-skeleton";
import { ContentTypeTabs } from "./content-type-tabs";
import { SavingTipList } from "./saving-tip-list";

/**
 * 종류 탭 + 필터 칩 + 혜택 목록. 필터링·페이지네이션은 서버(`/api/policies`)가 한다.
 * URL은 history.replaceState로만 동기화해(서버 재렌더 없음) 공유·딥링크는 유지하되 전환은
 * 끊김 없이 반영된다. 초기 필터는 클라이언트에서 searchParams를 읽어 정한다.
 *
 * 저장 목록은 여기 없다 — 별도 화면(`/benefits/saved`)이다.
 */
interface BenefitsExplorerProps {
  contentType?: BenefitContentType;
  onContentTypeChange?: (contentType: BenefitContentType) => void;
}

export function BenefitsExplorer({
  contentType: controlledContentType,
  onContentTypeChange,
}: BenefitsExplorerProps) {
  const searchParams = useSearchParams();
  const [uncontrolledContentType, setUncontrolledContentType] =
    useState<BenefitContentType>("policy");
  const contentType = controlledContentType ?? uncontrolledContentType;
  const [filter, setFilter] = useState<BenefitFilter>(() => {
    const categories = searchParams.getAll("category");
    return parseBenefitFilter(categories.length === 1 ? categories[0] : undefined);
  });
  const activeFilterRef = useRef(filter);
  const [isRetryingInitial, setIsRetryingInitial] = useState(false);
  const queryClient = useQueryClient();
  const toggleBookmark = useMutation(togglePolicyBookmarkOptions());
  // 언제 보낼지와 그동안 화면을 어떻게 보일지는 큐가 맡는다 — mutation 자체는 여기서 만든다.
  const { saveError, clearSaveError, toggleSaved } = useSavedToggleQueue(
    queryClient,
    toggleBookmark.mutate,
  );
  const isTipTab = contentType === "tip";

  function selectContentType(next: BenefitContentType) {
    setUncontrolledContentType(next);
    onContentTypeChange?.(next);
  }

  const policies = useInfiniteQuery({
    ...policiesOptions(getBenefitFilterCategory(filter)),
    enabled: !isTipTab,
  });

  const benefits: readonly BenefitItem[] = (policies.data?.pages.flat() ?? []).map(toBenefitItem);
  const isPending = policies.isPending;
  const isInitialError = policies.isError && benefits.length === 0;

  const { fetchNextPage, hasNextPage, isFetchNextPageError, isFetchingNextPage } = policies;
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const benefitsListRef = useRef<HTMLElement>(null);

  // 목록 끝이 보이면 다음 페이지를 당긴다. 스크롤 이벤트로 위치를 재면 매 프레임 레이아웃을
  // 읽어야 하지만, observer는 브라우저가 교차 시점만 알려준다.
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || !hasNextPage || isFetchingNextPage || isFetchNextPageError) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) fetchNextPage();
      },
      // 목록 끝에 닿기 한 화면 전에 미리 당긴다 — 정확히 바닥에서 시작하면 스크롤이 한 번 멈춘다.
      { rootMargin: "400px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError]);

  function selectFilter(next: BenefitFilter) {
    activeFilterRef.current = next;
    setIsRetryingInitial(false);
    setFilter(next);
    clearSaveError();
    window.history.replaceState(null, "", getBenefitFilterHref(next));
  }

  function focusBenefitsList() {
    window.requestAnimationFrame(() => benefitsListRef.current?.focus({ preventScroll: true }));
  }

  async function retryInitialPage() {
    const retryFilter = filter;
    setIsRetryingInitial(true);
    const result = await policies.refetch();
    if (activeFilterRef.current !== retryFilter) return;
    setIsRetryingInitial(false);
    if (result.isSuccess) focusBenefitsList();
  }

  async function retryNextPage() {
    const result = await fetchNextPage();
    if (result.isSuccess) focusBenefitsList();
  }

  if (isTipTab) {
    return (
      <>
        <ContentTypeTabs className="pt-2.5" selected={contentType} onSelect={selectContentType} />
        <div id="benefit-content-panel" role="tabpanel" aria-labelledby="benefit-content-tab-tip">
          <SavingTipList />
        </div>
      </>
    );
  }

  return (
    <>
      <ContentTypeTabs className="pt-2.5" selected={contentType} onSelect={selectContentType} />
      <div id="benefit-content-panel" role="tabpanel" aria-labelledby="benefit-content-tab-policy">
        <div className="mt-[23px]">
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
          {isPending || isInitialError || isRetryingInitial
            ? ""
            : benefits.length > 0
              ? "혜택 목록을 불러왔어요."
              : "조건에 맞는 혜택이 없어요."}
        </p>
        <section
          ref={benefitsListRef}
          id="benefits-list"
          aria-label="정책 목록"
          className="mt-5 flex flex-col gap-3 px-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          tabIndex={-1}
        >
          {saveError ? (
            <p aria-live="polite" className="text-body-b2-500 text-error">
              {saveError}
            </p>
          ) : null}
          {isPending && !isRetryingInitial ? (
            <BenefitListSkeleton />
          ) : isInitialError || isRetryingInitial ? (
            <div className="flex flex-col items-center py-10 text-center">
              {/* 칩을 눌러 실패했을 때 초점은 칩에 남는다 — alert로 알려야 화면 밖 사용자도 안다. */}
              <p
                role={isRetryingInitial ? "status" : "alert"}
                className="text-body-b2-500 text-gray-500"
              >
                {isRetryingInitial
                  ? "혜택을 다시 불러오는 중이에요."
                  : "혜택을 불러오지 못했어요. 잠시 후 다시 시도해 주세요."}
              </p>
              <Button
                className="mt-4"
                pending={isRetryingInitial}
                size="sm"
                onClick={() => void retryInitialPage()}
              >
                다시 시도
              </Button>
            </div>
          ) : benefits.length === 0 ? (
            <p className="py-10 text-center text-body-b2-500 text-gray-500">
              해당하는 혜택이 없어요.
            </p>
          ) : (
            <>
              {benefits.map((benefit) => (
                <BenefitCard key={benefit.id} benefit={benefit} onToggleSave={toggleSaved} />
              ))}
              {isFetchingNextPage && !isFetchNextPageError ? (
                <BenefitListSkeleton count={1} />
              ) : null}
              {isFetchNextPageError ? (
                <div className="flex flex-col items-center py-5 text-center">
                  <p
                    role={isFetchingNextPage ? "status" : "alert"}
                    className="text-body-b2-500 text-gray-500"
                  >
                    {isFetchingNextPage
                      ? "다음 혜택을 다시 불러오는 중이에요."
                      : "다음 혜택을 불러오지 못했어요. 다시 시도해 주세요."}
                  </p>
                  <Button
                    className="mt-3"
                    pending={isFetchingNextPage}
                    size="sm"
                    variant="secondary"
                    onClick={() => void retryNextPage()}
                  >
                    다시 시도
                  </Button>
                </div>
              ) : null}
            </>
          )}
          {/* 다음 페이지 감지용. */}
          {hasNextPage ? <div ref={loadMoreRef} aria-hidden="true" /> : null}
        </section>
      </div>
    </>
  );
}
