"use client";

import { Button, Dialog } from "@repo/ui";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { withdrawGuestOptions } from "@/lib/queries/auth";

const WITHDRAWAL_ERROR_MESSAGE = "탈퇴하지 못했어요. 잠시 후 다시 시도해주세요.";

/** 약관 제14조·개인정보처리방침 제10조가 적은 삭제 범위와 같은 것을 화면 말로 옮긴 것이다. */
const WITHDRAWAL_LOSS_ITEMS = [
  "목표 금액과 저축 기록",
  "진행 중인 미션과 완료 기록",
  "온보딩에서 답한 재무상태 정보",
];

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
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string>();
  const { mutate: withdraw, isPending } = useMutation(withdrawGuestOptions());

  function openDialog() {
    setError(undefined);
    // 지난번 확인이 남아 있으면 다시 열었을 때 바로 눌러진다.
    setIsConfirmed(false);
    setIsDialogOpen(true);
  }

  function closeDialog() {
    if (isPending) return;
    setError(undefined);
    setIsConfirmed(false);
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
        contentClassName="max-w-[320px]"
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        {/* 되돌릴 수 없는 동작이다. 무엇이 사라지는지 보여주지 않으면 눌러 보고 알게 된다. */}
        <div className="flex w-full flex-col gap-2 text-left">
          <p className="text-body-b2-500 text-gray-700">탈퇴하면 아래 기록이 모두 지워져요.</p>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-body-b2-500 text-gray-700">
            {WITHDRAWAL_LOSS_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="text-body-b2-700 text-gray-900">지워진 기록은 되돌릴 수 없어요.</p>
        </div>

        {/* 확인 없이 바로 지워지지 않게 한 번 더 막는다. */}
        <label className="flex w-full items-start gap-2 text-body-b2-500 text-gray-700">
          <input
            checked={isConfirmed}
            className="mt-0.5 size-4 shrink-0 accent-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={isPending}
            type="checkbox"
            onChange={(event) => setIsConfirmed(event.target.checked)}
          />
          위 내용을 확인했어요
        </label>

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
          {/* 되돌릴 수 없는 쪽이라 일반 CTA와 같은 파란색을 쓰지 않는다. */}
          <Button
            className="h-[52px] text-body-b1-700"
            variant="destructive"
            size="cta"
            disabled={isPending || !isConfirmed}
            onClick={confirmWithdrawal}
          >
            {isPending ? "탈퇴 중…" : "탈퇴하기"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
