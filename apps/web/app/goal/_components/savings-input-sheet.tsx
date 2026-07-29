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
  const [value, setValue] = useState(String(initialManwon));
  const [submitError, setSubmitError] = useState<string>();
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation(updateSavingsOptions(queryClient));

  // 시트는 항상 마운트 상태(open 제어)라 useState 초기값이 재오픈 시 반영되지 않는다.
  // 열 때마다 최신 프리필로 되돌린다.
  useEffect(() => {
    if (open) {
      setValue(String(initialManwon));
      setSubmitError(undefined);
    }
  }, [open, initialManwon]);

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
          onChange={(event) => setValue(clampDigits(event.target.value, MAX_SAVED_AMOUNT_MANWON))}
        />
        {submitError ? (
          <p aria-live="polite" className="text-body-b2-500 text-error">
            {submitError}
          </p>
        ) : null}
        <Button size="cta" disabled={isPending || value === ""} onClick={submit}>
          완료
        </Button>
      </div>
    </BottomSheet>
  );
}
