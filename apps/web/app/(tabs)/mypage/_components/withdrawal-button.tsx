"use client";

import { bridge, isNativeApp } from "@repo/bridge";
import { Button, Dialog } from "@repo/ui";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { withdrawGuestOptions } from "@/lib/queries/auth";
import { SettingButtonRow } from "./setting-row";

const WITHDRAWAL_ERROR_MESSAGE = "탈퇴하지 못했어요. 잠시 후 다시 시도해주세요.";

async function moveToNewGuestOnboarding() {
  // BE는 탈퇴와 함께 현재 access/refresh token을 무효화하지만, 네이티브 메모리·SecureStore에는
  // 그 무효 토큰이 그대로 남는다. 지우지 않으면 새로 고침 뒤 첫 요청이 무효 토큰으로 401을
  // 받고, refresh도 무효 토큰이라 또 거부당하고서야 신규 발급으로 넘어가 왕복이 두 번 헛돈다
  // — 탈퇴 후 화면 전환이 유독 느리게 보이는 원인. 새로 고침 전에 비워 그 왕복을 건너뛴다.
  if (isNativeApp()) await bridge.clearGuestTokens().catch(() => {});
  window.location.replace("/onboarding/intro");
}

interface WithdrawalButtonProps {
  /** 탈퇴 성공 후 동작. 테스트에서는 문서 이동 없이 성공 여부를 확인하는 데 사용한다. */
  onWithdrawn?: () => void;
}

/** 탈퇴하기 — 다른 설정 항목과 같은 행이고, 삭제는 확인 다이얼로그를 거쳐야 일어난다. */
export function WithdrawalButton({
  onWithdrawn = moveToNewGuestOnboarding,
}: WithdrawalButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string>();
  const { mutate: withdraw, isPending } = useMutation(withdrawGuestOptions());

  function openDialog() {
    setError(undefined);
    setIsDialogOpen(true);
  }

  function closeDialog() {
    if (isPending) return;
    setError(undefined);
    setIsDialogOpen(false);
  }

  function confirmWithdrawal() {
    setError(undefined);
    withdraw(undefined, {
      onError: () => setError(WITHDRAWAL_ERROR_MESSAGE),
      onSuccess: onWithdrawn,
    });
  }

  return (
    <>
      <SettingButtonRow onClick={openDialog}>탈퇴하기</SettingButtonRow>

      <Dialog
        open={isDialogOpen}
        title="정말로 회원탈퇴를 하실건가요?"
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        {/*
          비어 있어도 노드를 남긴다 — 오류가 날 때 처음 마운트되는 live region은 대부분의
          스크린리더가 읽지 않는다. 빈 동안은 `sr-only`라 흐름 밖이라 버튼 간격도 안 벌어진다.
        */}
        <p
          aria-live="polite"
          className={
            error
              ? "text-center text-body-b2-500 text-error"
              : "sr-only text-center text-body-b2-500 text-error"
          }
        >
          {error}
        </p>
        <div className="flex w-full gap-2.5">
          {/* 시안이 취소 쪽을 먼저 둔다 — 되돌릴 수 없는 쪽을 손이 먼저 닿는 자리에 두지 않는다. */}
          <Button
            className="h-[52px] flex-1 rounded-xl bg-gray-50 text-body-b1-700 text-gray-800 hover:bg-gray-100"
            variant="secondary"
            size="cta"
            disabled={isPending}
            onClick={closeDialog}
          >
            아니요
          </Button>
          {/*
            되돌릴 수 없는 쪽이라 일반 CTA와 같은 파란색을 쓰지 않는다.
            처리 중은 `disabled`가 아니라 `pending`이다 — disabled는 초점을 body로 보내
            방금 누른 버튼의 `aria-busy`가 스크린리더에 닿지 못한다(`@repo/ui` Button).
          */}
          <Button
            className="h-[52px] flex-1 rounded-xl bg-error-light text-body-b1-700 text-error hover:bg-error-light/80"
            variant="destructive"
            size="cta"
            pending={isPending}
            onClick={confirmWithdrawal}
          >
            탈퇴하기
          </Button>
        </div>
      </Dialog>
    </>
  );
}
