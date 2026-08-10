import { MAX_SAVED_AMOUNT_MANWON } from "@repo/schema/goal";
import { AmountField, BottomSheet, Button } from "@repo/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SAVE_FAILED_TEXT } from "@/lib/messages";
import { clampDigits, onlyDigits } from "@/lib/number";
import { updateSavingsOptions } from "@/lib/queries/goal";

interface SavingsInputSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 시트를 열 때 채워둘 현재 저축액(만원). */
  initialManwon: number;
}

/** 현재 저축액 입력 바텀시트 — PUT /api/goal/savings. */
export function SavingsInputSheet({ open, onOpenChange, initialManwon }: SavingsInputSheetProps) {
  // 사용자가 고치기 전에는 null이다. 그동안 프리필을 그대로 보여주므로 뒤늦게 도착한
  // 최신 값도 저절로 반영되고, 고친 뒤에는 백그라운드 재조회가 입력을 덮지 못한다.
  const [draft, setDraft] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string>();
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation(updateSavingsOptions(queryClient));
  const value = draft ?? String(initialManwon);

  // 시트는 항상 마운트 상태(open 제어)라 다시 열어도 이전 입력이 남는다. 닫힐 때
  // 버려서 다음에 열 때 최신 값으로 시작하게 한다 — 열릴 때 지우면 한 프레임 깜빡인다.
  useEffect(() => {
    if (open) return;
    setDraft(null);
    setSubmitError(undefined);
  }, [open]);

  function submit() {
    const savedAmountManwon = Number(onlyDigits(value));
    setSubmitError(undefined);
    mutate(
      { savedAmountManwon },
      {
        onError: () => setSubmitError(SAVE_FAILED_TEXT),
        onSuccess: () => onOpenChange(false),
      },
    );
  }

  return (
    <BottomSheet open={open} title="현재 저축액 입력" onOpenChange={onOpenChange}>
      <div className="flex flex-col gap-6 px-5 pt-6 pb-8">
        <AmountField
          label="저축액"
          inputMode="numeric"
          value={value}
          maxLength={String(MAX_SAVED_AMOUNT_MANWON).length}
          onChange={(event) => setDraft(clampDigits(event.target.value, MAX_SAVED_AMOUNT_MANWON))}
        />
        {submitError ? (
          <p aria-live="polite" className="text-body-b2-500 text-error">
            {submitError}
          </p>
        ) : null}
        <Button size="cta" disabled={value === ""} pending={isPending} onClick={submit}>
          완료
        </Button>
      </div>
    </BottomSheet>
  );
}
