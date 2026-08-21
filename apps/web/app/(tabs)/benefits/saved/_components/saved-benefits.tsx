"use client";

import { Button } from "@repo/ui";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BenefitCard } from "@/app/(tabs)/benefits/_components/benefit-card";
import { BenefitListSkeleton } from "@/app/(tabs)/benefits/_components/benefit-list-skeleton";
import { ContentTypeTabs } from "@/app/(tabs)/benefits/_components/content-type-tabs";
import { useSavedToggleQueue } from "@/app/(tabs)/benefits/_hooks/use-saved-toggle-queue";
import { toSavedBenefitItem } from "@/app/(tabs)/benefits/lib/benefit-items";
import { readCachedPolicyCategories } from "@/app/(tabs)/benefits/lib/policy-category-cache";
import type { BenefitContentType, BenefitItem } from "@/app/(tabs)/benefits/types";
import { savedPoliciesOptions } from "@/lib/queries/bookmark";
import { policyDetailOptions, togglePolicyBookmarkOptions } from "@/lib/queries/policy";
import { SavedBenefitCancelDialog } from "./saved-benefit-cancel-dialog";

/**
 * 두 탭의 빈 상태 문구가 같은 자리에 오도록 여백을 한 곳에서 정한다.
 *
 * 탭을 바꾸면 보여줄 게 없다는 문구는 그대로인데 자리만 움직여, 화면이 한 번 덜컹인다.
 * 문구가 서로 다른 부모에 있어(팁은 탭 패널 직속, 정책은 목록 `section` 안) 여백이
 * 갈렸다 — 값을 여기 모아 두 곳이 같은 값을 쓰게 한다.
 */
const EMPTY_MESSAGE_CLASS = "py-20 text-center text-body-b2-500 text-gray-500";

/**
 * 저장한 혜택 목록.
 *
 * 저장 목록 응답에는 카드 태그로 쓸 분류가 없어 항목마다 상세를 함께 조회한다
 * (`useQueries`). 목록이 한 번에 다 오므로 무한 스크롤은 없다.
 */
export function SavedBenefits() {
  const [contentType, setContentType] = useState<BenefitContentType>("policy");
  const [cancelTarget, setCancelTarget] = useState<BenefitItem>();
  const queryClient = useQueryClient();
  const toggleBookmark = useMutation(togglePolicyBookmarkOptions());
  const { saveError, clearSaveError, toggleSaved } = useSavedToggleQueue(
    queryClient,
    toggleBookmark.mutate,
  );
  const isTipTab = contentType === "tip";

  const saved = useQuery({ ...savedPoliciesOptions(), enabled: !isTipTab });

  // 목록에서 이미 받아 둔 분류는 다시 부르지 않는다 — 저장 30개면 상세 요청이 30번 나갔다.
  // 진입 시점 한 번만 읽는다: 캐시는 렌더 밖에서 바뀌는 값이라 렌더마다 읽으면 같은 렌더가
  // 매번 다른 답을 낼 수 있고, 여기서 필요한 건 "지금 무엇을 안 불러도 되는가" 뿐이다.
  const [cachedCategories] = useState(() => readCachedPolicyCategories(queryClient));
  const savedPolicyDetails = useQueries({
    queries: (saved.data ?? []).map(({ id }) => ({
      ...policyDetailOptions(id),
      enabled: !isTipTab && !cachedCategories.has(id),
    })),
  });

  const benefits: readonly BenefitItem[] = (saved.data ?? []).map((item, index) =>
    toSavedBenefitItem(
      item,
      // 조회를 끈 기준과 값을 읽는 기준을 같게 둔다 — `??`로 두면 분류가 빈 정책에서,
      // 카드를 눌러 상세가 캐시에 채워진 뒤 태그가 뒤늦게 튀어나온다.
      cachedCategories.has(item.id)
        ? cachedCategories.get(item.id)
        : savedPolicyDetails[index]?.data?.category,
    ),
  );

  function askToCancel(benefit: BenefitItem) {
    clearSaveError();
    setCancelTarget(benefit);
  }

  function closeCancelDialog() {
    clearSaveError();
    setCancelTarget(undefined);
  }

  function confirmCancel() {
    if (!cancelTarget) return;
    const target = cancelTarget;
    setCancelTarget(undefined);
    toggleSaved(target);
  }

  if (isTipTab) {
    return (
      <>
        <ContentTypeTabs
          className="pt-5"
          idPrefix="saved-content"
          selected={contentType}
          onSelect={setContentType}
        />
        <div aria-labelledby="saved-content-tab-tip" id="saved-content-panel" role="tabpanel">
          <p className={`px-5 ${EMPTY_MESSAGE_CLASS}`}>
            절약 팁 저장은 준비 중이에요.
            <br />
            조금만 기다려 주세요.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <ContentTypeTabs
        className="pt-5"
        idPrefix="saved-content"
        selected={contentType}
        onSelect={setContentType}
      />
      <div aria-labelledby="saved-content-tab-policy" id="saved-content-panel" role="tabpanel">
        <section aria-label="저장한 혜택" className="mt-5 flex flex-col gap-3 px-5">
          {saveError && !cancelTarget ? (
            <p aria-live="polite" className="text-body-b2-500 text-error">
              {saveError}
            </p>
          ) : null}
          {saved.isPending ? (
            <BenefitListSkeleton />
          ) : saved.isError ? (
            <div className="flex flex-col items-center py-10 text-center">
              <p className="text-body-b2-500 text-gray-500" role="alert">
                저장한 혜택을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
              </p>
              <Button className="mt-4" size="sm" onClick={() => void saved.refetch()}>
                다시 시도
              </Button>
            </div>
          ) : benefits.length === 0 ? (
            // 목록에 붙은 `mt-5`는 카드용 여백이라 문구에는 걸리지 않게 상쇄한다 —
            // 그래야 팁 탭 문구와 탭에서 같은 거리에 선다(좌우 여백은 목록 것을 쓴다).
            <p className={`-mt-5 ${EMPTY_MESSAGE_CLASS}`}>
              저장한 혜택이 없어요.
              <br />
              관심 있는 혜택의 별을 눌러 저장해보세요.
            </p>
          ) : (
            benefits.map((benefit) => (
              <BenefitCard benefit={benefit} key={benefit.id} onToggleSave={askToCancel} />
            ))
          )}
        </section>
      </div>
      <SavedBenefitCancelDialog
        error={saveError}
        open={Boolean(cancelTarget)}
        onCancel={closeCancelDialog}
        onConfirm={confirmCancel}
      />
    </>
  );
}
