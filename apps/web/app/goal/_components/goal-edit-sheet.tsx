"use client";

import { AmountField, BottomSheet, Button } from "@repo/ui";
import { useEffect, useState } from "react";
import { useUpdateGoal } from "../queries";

interface GoalEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTargetManwon: number;
}

const onlyDigits = (value: string) => value.replace(/\D/g, "");
/** 빈 입력·0은 "미변경"(null)으로 본다. PATCH 계약이 목표액/기간에 양수만 허용하기 때문. */
const toNullableAmount = (value: string): number | null => {
  const n = Number(onlyDigits(value));
  return n > 0 ? n : null;
};

/**
 * 목표 금액·기간 수정 바텀시트 — PATCH /api/goal.
 * 목표 현황 응답에는 기간 필드가 없어 프리필 소스가 없다 — 기간은 빈칸으로 시작하고,
 * 입력했을 때만 전송한다(미입력이면 null=미변경).
 */
export function GoalEditSheet({ open, onOpenChange, initialTargetManwon }: GoalEditSheetProps) {
  const [target, setTarget] = useState(String(initialTargetManwon));
  const [period, setPeriod] = useState("");
  const { mutate, isPending } = useUpdateGoal();

  // 시트는 항상 마운트 상태(open 제어)라 useState 초기값이 재오픈 시 반영되지 않는다.
  // 열 때마다 목표 금액은 최신값으로, 기간은 빈칸(미변경)으로 되돌린다.
  useEffect(() => {
    if (open) {
      setTarget(String(initialTargetManwon));
      setPeriod("");
    }
  }, [open, initialTargetManwon]);

  function submit() {
    mutate(
      {
        targetAmountManwon: toNullableAmount(target),
        periodMonths: toNullableAmount(period),
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <BottomSheet open={open} title="수정" onOpenChange={onOpenChange}>
      <div className="flex flex-col gap-6 px-5 pt-6 pb-8">
        <AmountField
          label="목표 금액"
          inputMode="numeric"
          value={target}
          onChange={(event) => setTarget(onlyDigits(event.target.value))}
        />
        <AmountField
          label="목표 기간"
          unit="개월"
          inputMode="numeric"
          value={period}
          onChange={(event) => setPeriod(onlyDigits(event.target.value))}
        />
        <Button size="cta" disabled={isPending} onClick={submit}>
          완료
        </Button>
      </div>
    </BottomSheet>
  );
}
