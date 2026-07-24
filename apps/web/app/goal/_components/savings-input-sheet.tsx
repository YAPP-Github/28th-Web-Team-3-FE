"use client";

import { AmountField, BottomSheet, Button } from "@repo/ui";
import { useEffect, useState } from "react";
import { useUpdateSavings } from "../queries";

interface SavingsInputSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 시트를 열 때 채워둘 현재 저축액(만원). */
  initialManwon: number;
}

const onlyDigits = (value: string) => value.replace(/\D/g, "");

/** 현재 저축액 입력 바텀시트 — PUT /api/goal/savings. */
export function SavingsInputSheet({ open, onOpenChange, initialManwon }: SavingsInputSheetProps) {
  const [value, setValue] = useState(String(initialManwon));
  const { mutate, isPending } = useUpdateSavings();

  // 시트는 항상 마운트 상태(open 제어)라 useState 초기값이 재오픈 시 반영되지 않는다.
  // 열 때마다 최신 프리필로 되돌린다.
  useEffect(() => {
    if (open) setValue(String(initialManwon));
  }, [open, initialManwon]);

  function submit() {
    const savedAmountManwon = Number(onlyDigits(value));
    mutate({ savedAmountManwon }, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <BottomSheet open={open} title="현재 저축액 입력" onOpenChange={onOpenChange}>
      <div className="flex flex-col gap-6 px-5 pt-6 pb-8">
        <AmountField
          label="저축액"
          inputMode="numeric"
          value={value}
          onChange={(event) => setValue(onlyDigits(event.target.value))}
        />
        <Button size="cta" disabled={isPending || value === ""} onClick={submit}>
          완료
        </Button>
      </div>
    </BottomSheet>
  );
}
