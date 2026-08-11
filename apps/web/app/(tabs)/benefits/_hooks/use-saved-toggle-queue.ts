"use client";

import type { PolicySummary } from "@repo/schema/policy";
import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { bookmarkPolicy, unbookmarkPolicy } from "@/api/policy";
import {
  applyBookmarkToPolicies,
  applyBookmarkToSavedList,
} from "@/app/(tabs)/benefits/lib/bookmark-cache";
import type { BenefitItem } from "@/app/(tabs)/benefits/types";
import { savedPoliciesOptions } from "@/lib/queries/bookmark";
import { POLICIES_QUERY_KEY } from "@/lib/queries/policy";

const SAVE_FAILED = "저장 상태를 바꾸지 못했어요. 잠시 후 다시 시도해 주세요.";

/**
 * 마지막 누름 뒤 이만큼 조용하면 보낸다. 짧으면 연타가 그대로 요청이 되고, 길면 화면을
 * 떠날 때 아직 안 보낸 것이 쌓인다.
 */
const SEND_DELAY_MS = 400;

/**
 * `useMutation(togglePolicyBookmarkOptions()).mutate`를 그대로 받는다. 이 훅은 mutation을
 * 직접 만들지 않는다 — 서버 상태는 화면이 options를 주입해 쓰고(AGENTS.md), 여기서는 언제
 * 보낼지와 그동안 화면을 어떻게 보일지만 관리한다.
 */
type ToggleBookmark = (
  variables: { policyId: number; saved: boolean },
  callbacks: { onSuccess: () => void; onError: () => void; onSettled: () => void },
) => void;

interface PendingToggle {
  /** 서버가 확정한 값. 성공 응답으로만 바뀐다. */
  serverSaved: boolean;
  /** 사용자가 마지막으로 원한 값. */
  desired: boolean;
  timer: ReturnType<typeof setTimeout> | null;
  /** 요청이 나가 있는 동안은 지우지 않는다 — 지우면 낙관적 값을 서버값으로 착각한다. */
  inFlight: boolean;
}

/**
 * 저장 토글을 모아 보내는 큐 — 화면은 즉시 바꾸고 요청은 정책당 하나씩만 흐르게 한다.
 *
 * 별을 연타하면 켬·끔이 번갈아 쌓인다. 그때마다 보내면 응답 순서가 뒤집혀 화면과 서버가
 * 어긋나고, 짝수 번 눌러 제자리로 돌아온 경우엔 아무 일도 없어야 하는데 두 번 왕복한다.
 *
 * 요청이 나가 있는 동안 또 눌러도 그 항목을 큐에서 지우지 않는다. 지우면 다음 누름이 아직
 * 확정되지 않은 낙관적 값을 서버값으로 삼아, 앞선 요청이 실패했을 때 보낼 것을 건너뛴다.
 */
export function useSavedToggleQueue(queryClient: QueryClient, toggleBookmark: ToggleBookmark) {
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

  function cancelOngoingFetches() {
    // 먼저 시작한 GET이 늦게 끝나 낙관적 캐시를 옛 값으로 덮지 못하게 한다. cancelQueries는
    // 즉시 결과 반영을 막으므로 기다리지 않고 이어 써도 클릭 반영은 동기적으로 유지된다.
    void queryClient.cancelQueries({ queryKey: POLICIES_QUERY_KEY });
    void queryClient.cancelQueries({ queryKey: savedPoliciesOptions().queryKey });
  }

  function markCachesStale() {
    // 다음 진입에는 서버와 다시 맞추되, 방금 성공한 직후 즉시 GET을 보내 이전 값이 돌아오는
    // 경합은 만들지 않는다.
    void queryClient.invalidateQueries({ queryKey: POLICIES_QUERY_KEY, refetchType: "none" });
    void queryClient.invalidateQueries({
      queryKey: savedPoliciesOptions().queryKey,
      refetchType: "none",
    });
  }

  function settle(benefit: BenefitItem, pending: PendingToggle) {
    pending.inFlight = false;
    if (pending.desired !== pending.serverSaved) {
      // 요청이 나가 있는 사이에 또 눌렸다 — 확정된 값을 기준으로 이어 보낸다.
      flush(benefit);
      return;
    }
    cancelOngoingFetches();
    // 클릭 뒤 새로 시작된 GET이 먼저 끝났어도 서버가 확정한 최종값으로 다시 덮는다.
    writeCache(benefit, pending.serverSaved);
    pendingRef.current.delete(benefit.id);
    markCachesStale();
  }

  function flush(benefit: BenefitItem) {
    const pending = pendingRef.current.get(benefit.id);
    if (!pending) return;
    pending.timer = null;
    // 앞선 요청이 아직 안 끝났다. 끝나는 쪽(settle)이 이어서 보낸다.
    if (pending.inFlight) return;

    if (pending.desired === pending.serverSaved) {
      pendingRef.current.delete(benefit.id);
      return;
    }

    const sending = pending.desired;
    pending.inFlight = true;
    toggleBookmark(
      // `saved`는 누르기 직전 값이다. 서버가 확정한 값을 넘겨야 반대 동작이 나간다.
      { policyId: benefit.id, saved: pending.serverSaved },
      {
        onSuccess: () => {
          pending.serverSaved = sending;
        },
        onError: () => {
          // 되돌리고 멈춘다. 자동으로 다시 보내면 같은 실패를 반복한다.
          pending.desired = pending.serverSaved;
          writeCache(benefit, pending.serverSaved);
          setSaveError(SAVE_FAILED);
        },
        onSettled: () => settle(benefit, pending),
      },
    );
  }

  function toggleSaved(benefit: BenefitItem) {
    setSaveError(undefined);
    cancelOngoingFetches();

    const pending = pendingRef.current.get(benefit.id);
    if (pending) {
      // 새 객체로 갈아끼우지 않는다 — 나가 있는 요청의 콜백이 이 객체를 붙잡고 있어서,
      // 교체하면 응답이 와도 큐에 있는 쪽이 아니라 버려진 객체가 갱신된다.
      if (pending.timer) clearTimeout(pending.timer);
      pending.desired = !pending.desired;
      writeCache(benefit, pending.desired);
      pending.timer = setTimeout(() => flush(benefit), SEND_DELAY_MS);
      return;
    }

    // 첫 누름일 때만 화면의 값이 곧 서버값이다.
    const desired = !benefit.saved;
    writeCache(benefit, desired);
    pendingRef.current.set(benefit.id, {
      serverSaved: benefit.saved,
      desired,
      inFlight: false,
      timer: setTimeout(() => flush(benefit), SEND_DELAY_MS),
    });
  }

  useEffect(() => {
    const pending = pendingRef.current;
    return () => {
      for (const [policyId, toggle] of pending) {
        if (toggle.timer) clearTimeout(toggle.timer);
        // 이미 나간 요청은 그대로 두고, 아직 안 보낸 것만 보낸다.
        if (toggle.inFlight || toggle.desired === toggle.serverSaved) continue;
        // 화면을 떠나도 누른 것은 보낸다. 되돌릴 화면이 없으므로 mutate 대신 API를 직접
        // 부르고, 결과는 다음 진입의 재조회가 정한다.
        const request = toggle.desired ? bookmarkPolicy(policyId) : unbookmarkPolicy(policyId);
        void request.catch(() => {});
      }
      pending.clear();
    };
  }, []);

  return { saveError, clearSaveError: () => setSaveError(undefined), toggleSaved };
}
