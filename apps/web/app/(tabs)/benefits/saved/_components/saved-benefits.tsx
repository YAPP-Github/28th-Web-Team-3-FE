"use client";

import { Button } from "@repo/ui";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BenefitCard } from "@/app/(tabs)/benefits/_components/benefit-card";
import { BenefitListSkeleton } from "@/app/(tabs)/benefits/_components/benefit-list-skeleton";
import { ContentTypeTabs } from "@/app/(tabs)/benefits/_components/content-type-tabs";
import { useSavedToggleQueue } from "@/app/(tabs)/benefits/_hooks/use-saved-toggle-queue";
import { toSavedBenefitItem } from "@/app/(tabs)/benefits/lib/benefit-items";
import type { BenefitContentType, BenefitItem } from "@/app/(tabs)/benefits/types";
import { savedPoliciesOptions } from "@/lib/queries/bookmark";
import { policyDetailOptions, togglePolicyBookmarkOptions } from "@/lib/queries/policy";
import { SavedBenefitCancelDialog } from "./saved-benefit-cancel-dialog";

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
  const savedPolicyDetails = useQueries({
    queries: (saved.data ?? []).map(({ id }) => ({
      ...policyDetailOptions(id),
      enabled: !isTipTab,
    })),
  });

  const benefits: readonly BenefitItem[] = (saved.data ?? []).map((item, index) =>
    toSavedBenefitItem(item, savedPolicyDetails[index]?.data?.category),
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
          <p className="px-5 py-20 text-center text-body-b2-500 text-gray-500">
            블로그 팁은 준비 중이에요.
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
        <section aria-label="저장한 혜택" className="mt-2 flex flex-col gap-3 px-5">
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
            <p className="py-10 text-center text-body-b2-500 text-gray-500">
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
