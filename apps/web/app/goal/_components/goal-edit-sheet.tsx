import {
  MAX_GOAL_PERIOD_MONTHS,
  MAX_GOAL_TARGET_MANWON,
  MIN_GOAL_PERIOD_MONTHS,
} from "@repo/schema/goal";
import { MAX_MONTHLY_AMOUNT } from "@repo/schema/onboarding";
import { AmountField, BottomSheet, Button } from "@repo/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SAVE_FAILED_TEXT } from "@/lib/messages";
import { clampDigits, onlyDigits } from "@/lib/number";
import { updateGoalOptions } from "@/lib/queries/goal";
import { onboardingProfileOptions, patchOnboardingProfileOptions } from "@/lib/queries/onboarding";

interface GoalEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTargetManwon: number;
}

/** 빈 입력·0은 "미변경"(null)으로 본다. PATCH 계약이 목표액/기간에 양수만 허용하기 때문. */
const toNullableAmount = (value: string): number | null => {
  const n = Number(onlyDigits(value));
  return n > 0 ? n : null;
};
const toMonthlySalary = (value: string): number | null => {
  const amount = toNullableAmount(value);
  return amount == null ? null : Math.min(amount, MAX_MONTHLY_AMOUNT);
};
/** 아직 없는 프로필 값은 빈 칸으로 둔다. */
const toPrefill = (value: number | null | undefined): string =>
  value == null ? "" : String(value);

/**
 * 목표 금액·기간·월소득 수정 바텀시트.
 */
export function GoalEditSheet({ open, onOpenChange, initialTargetManwon }: GoalEditSheetProps) {
  // 각 칸은 사용자가 고치기 전에는 null이다. 그동안 프리필을 그대로 보여주므로 뒤늦게
  // 도착한 프로필도 저절로 반영되고, 고친 뒤에는 백그라운드 재조회가 입력을 덮지 못한다.
  const [targetDraft, setTargetDraft] = useState<string | null>(null);
  const [periodDraft, setPeriodDraft] = useState<string | null>(null);
  const [monthlySalaryDraft, setMonthlySalaryDraft] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string>();
  const queryClient = useQueryClient();
  const { mutateAsync: updateGoal, isPending: isUpdatingGoal } = useMutation(
    updateGoalOptions(queryClient),
  );
  const { data: profile } = useQuery(onboardingProfileOptions());
  const { mutateAsync: patchProfile, isPending: isPatchingProfile } = useMutation(
    patchOnboardingProfileOptions(queryClient),
  );

  const target = targetDraft ?? String(initialTargetManwon);
  const period = periodDraft ?? toPrefill(profile?.goalPeriodMonths);
  const monthlySalary = monthlySalaryDraft ?? toPrefill(profile?.monthlySalaryManwon);

  // 시트는 항상 마운트 상태(open 제어)라 다시 열어도 이전 입력이 남는다. 닫힐 때
  // 버려서 다음에 열 때 최신 값으로 시작하게 한다 — 열릴 때 지우면 한 프레임 깜빡인다.
  useEffect(() => {
    if (open) return;
    setTargetDraft(null);
    setPeriodDraft(null);
    setMonthlySalaryDraft(null);
    setSubmitError(undefined);
  }, [open]);

  async function submit() {
    const totalTargetManwon = toNullableAmount(target);
    const periodMonths = toNullableAmount(period);
    const monthlySalaryManwon = toMonthlySalary(monthlySalary);

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

    // 여기부터는 목표가 이미 저장된 뒤다. 프로필 저장이 실패해도 되돌릴 수 없으므로
    // "전부 실패"처럼 안내하면 사용자가 목표를 처음부터 다시 입력한다. 무엇이 남았는지 알린다.
    const profilePatch = {
      ...(monthlySalaryManwon != null ? { monthlySalaryManwon } : {}),
      ...(periodMonths != null ? { goalPeriodMonths: periodMonths } : {}),
    };

    if (Object.keys(profilePatch).length > 0) {
      try {
        await patchProfile(profilePatch);
      } catch {
        setSubmitError(
          "목표는 저장했지만 일부 정보를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.",
        );
        return;
      }
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
        <div className="grid grid-cols-2 gap-2.5">
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
          <AmountField
            label="월소득"
            unit="만원"
            inputMode="numeric"
            value={monthlySalary}
            maxLength={String(MAX_MONTHLY_AMOUNT).length}
            onChange={(event) =>
              setMonthlySalaryDraft(clampDigits(event.target.value, MAX_MONTHLY_AMOUNT))
            }
          />
        </div>
        {submitError ? (
          <p aria-live="polite" className="text-body-b2-500 text-error">
            {submitError}
          </p>
        ) : null}
        <Button size="cta" disabled={isUpdatingGoal || isPatchingProfile} onClick={submit}>
          완료
        </Button>
      </div>
    </BottomSheet>
  );
}
