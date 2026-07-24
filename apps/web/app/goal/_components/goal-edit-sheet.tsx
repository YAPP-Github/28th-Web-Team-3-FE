"use client";

import { AmountField, BottomSheet, Button } from "@repo/ui";
import { useState } from "react";
import { useUpdateGoal } from "../queries";

interface GoalEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTargetManwon: number;
  initialPeriodMonths: number;
}

const onlyDigits = (value: string) => value.replace(/\D/g, "");

/** 목표 금액·기간 수정 바텀시트 — PATCH /api/goal. */
export function GoalEditSheet({
  open,
  onOpenChange,
  initialTargetManwon,
  initialPeriodMonths,
}: GoalEditSheetProps) {
  const [target, setTarget] = useState(String(initialTargetManwon));
  const [period, setPeriod] = useState(String(initialPeriodMonths));
  const { mutate, isPending } = useUpdateGoal();

  function submit() {
    mutate(
      {
        targetAmountManwon: target === "" ? null : Number(onlyDigits(target)),
        periodMonths: period === "" ? null : Number(onlyDigits(period)),
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <BottomSheet open={open} title="목표 수정" onOpenChange={onOpenChange}>
      <div className="flex flex-col gap-4 px-5 pt-6 pb-8">
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
        <Button className="mt-2" size="cta" disabled={isPending} onClick={submit}>
          저장
        </Button>
      </div>
    </BottomSheet>
  );
}
