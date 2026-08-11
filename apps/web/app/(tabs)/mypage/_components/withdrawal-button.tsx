"use client";

import { Button, Dialog } from "@repo/ui";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { withdrawGuestOptions } from "@/lib/queries/auth";
import { SettingButtonRow } from "./setting-row";

const WITHDRAWAL_ERROR_MESSAGE = "탈퇴하지 못했어요. 잠시 후 다시 시도해주세요.";

function moveToNewGuestOnboarding() {
  // BE는 탈퇴와 함께 현재 access/refresh token을 무효화한다. 문서를 다시 로드하면 웹의
  // 토큰·쿼리 캐시가 비워지고, 네이티브가 같은 기기 UUID로 새 게스트를 발급한다.
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
