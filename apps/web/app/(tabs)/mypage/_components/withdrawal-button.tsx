"use client";

import { Button, Dialog } from "@repo/ui";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { withdrawGuestOptions } from "@/lib/queries/auth";

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
      <div className="mt-4 border-gray-100 border-t pt-4">
        <button
          type="button"
          className="min-h-11 touch-manipulation rounded-sm text-body-b1-500 text-gray-300 transition-colors hover:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={openDialog}
        >
          탈퇴하기
        </button>
      </div>

      <Dialog
        open={isDialogOpen}
        title="정말 탈퇴할까요?"
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        {error ? (
          <p aria-live="polite" className="text-center text-body-b2-500 text-error">
            {error}
          </p>
        ) : null}
        <div className="grid w-full grid-cols-2 gap-2.5">
          <Button
            className="h-[52px] text-body-b1-700 text-gray-800"
            variant="secondary"
            size="cta"
            disabled={isPending}
            onClick={closeDialog}
          >
            취소
          </Button>
          <Button
            className="h-[52px] text-body-b1-700"
            size="cta"
            disabled={isPending}
            onClick={confirmWithdrawal}
          >
            {isPending ? "탈퇴 중…" : "탈퇴하기"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
