"use client";

import type { PolicySummary } from "@repo/schema/policy";
import { type InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { bookmarkPolicy, unbookmarkPolicy } from "@/api/policy";
import {
  applyBookmarkToPolicies,
  applyBookmarkToSavedList,
} from "@/app/(tabs)/benefits/lib/bookmark-cache";
import type { BenefitItem } from "@/app/(tabs)/benefits/types";
import { savedPoliciesOptions } from "@/lib/queries/bookmark";
import { POLICIES_QUERY_KEY, togglePolicyBookmarkOptions } from "@/lib/queries/policy";

const SAVE_FAILED = "저장 상태를 바꾸지 못했어요. 잠시 후 다시 시도해 주세요.";

/**
 * 마지막 누름 뒤 이만큼 조용하면 보낸다. 짧으면 연타가 그대로 요청이 되고, 길면 화면을
 * 떠날 때 아직 안 보낸 것이 쌓인다.
 */
const SEND_DELAY_MS = 400;

interface PendingToggle {
  /** 서버가 알고 있는 값. 되돌릴 때와 "보낼 게 있나" 판단의 기준이다. */
  serverSaved: boolean;
  /** 사용자가 마지막으로 원한 값. */
  desired: boolean;
  timer: ReturnType<typeof setTimeout>;
}

/**
 * 혜택 저장 토글 — 화면은 즉시 바꾸고 요청은 모아서 한 번만 보낸다.
 *
 * 별을 연타하면 켬·끔이 번갈아 쌓인다. 그때마다 요청을 보내면 순서가 뒤집혀 도착할 수 있고
 * (마지막에 보낸 게 먼저 끝나면 화면과 서버가 어긋난다), 짝수 번 눌러 제자리로 돌아온 경우엔
 * 아무 일도 없어야 하는데 두 번 왕복한다. 그래서 마지막 상태만 남겼다가 보내고, 서버가 이미
 * 그 상태면 아예 보내지 않는다.
 */
export function useToggleSavedBenefit() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation(togglePolicyBookmarkOptions());
  const pendingRef = useRef(new Map<number, PendingToggle>());
  const [saveError, setSaveError] = useState<string>();

  function writeCache(benefit: BenefitItem, saved: boolean) {
    queryClient.setQueriesData<InfiniteData<PolicySummary[]>>(
      { queryKey: POLICIES_QUERY_KEY },
      (data) => applyBookmarkToPolicies(data, benefit.id, saved),
    );
    queryClient.setQueryData(savedPoliciesOptions().queryKey, (list) =>
      applyBookmarkToSavedList(list, benefit, saved),
    );
  }

  /** 아직 보낼 게 남아 있는 동안 재조회하면 그 항목들이 옛 서버값으로 되돌아 보인다. */
  function refetchWhenIdle() {
    if (pendingRef.current.size > 0) return;
    queryClient.invalidateQueries({ queryKey: POLICIES_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: savedPoliciesOptions().queryKey });
  }

  function send(benefit: BenefitItem) {
    const pending = pendingRef.current.get(benefit.id);
    if (!pending) return;
    pendingRef.current.delete(benefit.id);

    // 눌렀다 되돌린 경우 — 서버는 이미 그 상태라 보낼 게 없다.
    if (pending.desired === pending.serverSaved) {
      refetchWhenIdle();
      return;
    }

    mutate(
      // `saved`는 누르기 직전 값이다. 서버가 아는 값을 그대로 넘겨야 반대 동작이 나간다.
      { policyId: benefit.id, saved: pending.serverSaved },
      {
        onError: () => {
          writeCache(benefit, pending.serverSaved);
          setSaveError(SAVE_FAILED);
        },
        onSettled: refetchWhenIdle,
      },
    );
  }

  function toggleSaved(benefit: BenefitItem) {
    setSaveError(undefined);

    const pending = pendingRef.current.get(benefit.id);
    if (pending) clearTimeout(pending.timer);

    // 첫 누름일 때만 화면의 값이 곧 서버값이다. 이어지는 누름은 이미 낙관적으로 바꿔둔
    // 값을 보고 있으므로 처음 잡아둔 기준을 계속 쓴다.
    const serverSaved = pending?.serverSaved ?? benefit.saved;
    const desired = !(pending?.desired ?? benefit.saved);

    writeCache(benefit, desired);
    pendingRef.current.set(benefit.id, {
      serverSaved,
      desired,
      timer: setTimeout(() => send(benefit), SEND_DELAY_MS),
    });
  }

  useEffect(() => {
    const pending = pendingRef.current;
    return () => {
      for (const [policyId, toggle] of pending) {
        clearTimeout(toggle.timer);
        if (toggle.desired === toggle.serverSaved) continue;
        // 화면을 떠나도 누른 것은 보낸다. 되돌릴 화면이 없으므로 결과는 다음 진입의
        // 재조회가 정한다 — mutate 대신 API를 직접 부르는 이유도 콜백이 필요 없어서다.
        const request = toggle.desired ? bookmarkPolicy(policyId) : unbookmarkPolicy(policyId);
        void request.catch(() => {});
      }
      pending.clear();
    };
  }, []);

  return { saveError, clearSaveError: () => setSaveError(undefined), toggleSaved };
}
