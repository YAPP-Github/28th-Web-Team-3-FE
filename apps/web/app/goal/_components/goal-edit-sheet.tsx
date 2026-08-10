import {
  MAX_GOAL_PERIOD_MONTHS,
  MAX_GOAL_TARGET_MANWON,
  MIN_GOAL_PERIOD_MONTHS,
} from "@repo/schema/goal";
import { AmountField, BottomSheet, Button } from "@repo/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SAVE_FAILED_TEXT } from "@/lib/messages";
import { clampDigits, onlyDigits } from "@/lib/number";
import { updateGoalOptions } from "@/lib/queries/goal";

interface GoalEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTargetManwon: number;
  initialPeriodMonths: number;
}

/** 빈 입력·0은 "미변경"(null)으로 본다. PATCH 계약이 목표액/기간에 양수만 허용하기 때문. */
const toNullableAmount = (value: string): number | null => {
  const n = Number(onlyDigits(value));
  return n > 0 ? n : null;
};

/** 목표 금액과 기간 수정 바텀시트. */
export function GoalEditSheet({
  open,
  onOpenChange,
  initialTargetManwon,
  initialPeriodMonths,
}: GoalEditSheetProps) {
  // 각 칸은 사용자가 고치기 전에는 null이다. 그동안 프리필을 그대로 보여주므로 뒤늦게
  // 도착한 목표도 저절로 반영되고, 고친 뒤에는 백그라운드 재조회가 입력을 덮지 못한다.
  const [targetDraft, setTargetDraft] = useState<string | null>(null);
  const [periodDraft, setPeriodDraft] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string>();
  const queryClient = useQueryClient();
  const { mutateAsync: updateGoal, isPending: isUpdatingGoal } = useMutation(
    updateGoalOptions(queryClient),
  );

  const target = targetDraft ?? String(initialTargetManwon);
  const period = periodDraft ?? String(initialPeriodMonths);

  // 시트는 항상 마운트 상태(open 제어)라 다시 열어도 이전 입력이 남는다. 닫힐 때
  // 버려서 다음에 열 때 최신 값으로 시작하게 한다 — 열릴 때 지우면 한 프레임 깜빡인다.
  useEffect(() => {
    if (open) return;
    setTargetDraft(null);
    setPeriodDraft(null);
    setSubmitError(undefined);
  }, [open]);

  async function submit() {
    const totalTargetManwon = toNullableAmount(target);
    const periodMonths = toNullableAmount(period);

    // 하한은 입력 중에 막지 않으므로 여기서 거른다 — 넘기면 서버가 400으로 되돌린다.
    if (periodMonths != null && periodMonths < MIN_GOAL_PERIOD_MONTHS) {
      setSubmitError(`목표 기간은 ${MIN_GOAL_PERIOD_MONTHS}개월 이상으로 입력해주세요.`);
      return;
    }

    setSubmitError(undefined);

    try {
      await updateGoal({ targetAmountManwon: totalTargetManwon, periodMonths });
    } catch {
      setSubmitError(SAVE_FAILED_TEXT);
      return;
    }

    onOpenChange(false);
  }

  return (
    <BottomSheet open={open} title="수정" onOpenChange={onOpenChange}>
      <div className="flex flex-col gap-6 px-5 pt-6 pb-8">
        <AmountField
          label="목표 금액"
          inputMode="numeric"
          value={target}
          onChange={(event) =>
            setTargetDraft(clampDigits(event.target.value, MAX_GOAL_TARGET_MANWON))
          }
        />
        <AmountField
          label="목표 기간"
          unit="개월"
          inputMode="numeric"
          value={period}
          maxLength={String(MAX_GOAL_PERIOD_MONTHS).length}
          onChange={(event) =>
            setPeriodDraft(clampDigits(event.target.value, MAX_GOAL_PERIOD_MONTHS))
          }
        />
        {submitError ? (
          <p aria-live="polite" className="text-body-b2-500 text-error">
            {submitError}
          </p>
        ) : null}
        <Button size="cta" pending={isUpdatingGoal} onClick={submit}>
          완료
        </Button>
      </div>
    </BottomSheet>
  );
}
