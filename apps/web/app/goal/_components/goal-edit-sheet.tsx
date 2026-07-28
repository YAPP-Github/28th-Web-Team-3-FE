import { MAX_MONTHLY_AMOUNT } from "@repo/schema";
import {
  MAX_GOAL_PERIOD_MONTHS,
  MAX_GOAL_TARGET_MANWON,
  MIN_GOAL_PERIOD_MONTHS,
} from "@repo/schema/goal";
import { AmountField, BottomSheet, Button } from "@repo/ui";
import { useEffect, useState } from "react";
import { useOnboardingProfile, usePatchOnboardingProfile } from "@/lib/onboarding/queries";
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
const toMonthlySalary = (value: string): number | null => {
  const amount = toNullableAmount(value);
  return amount == null ? null : Math.min(amount, MAX_MONTHLY_AMOUNT);
};
const clampMonthlySalaryInput = (value: string) => {
  const digits = onlyDigits(value);
  if (digits === "") return "";
  return String(Math.min(Number(digits), MAX_MONTHLY_AMOUNT));
};
/** 상한만 입력 단계에서 막는다 — 하한은 타이핑 도중 값이 튀지 않게 제출 시 검사한다. */
const clampToMax = (value: string, max: number) => {
  const digits = onlyDigits(value);
  if (digits === "") return "";
  return String(Math.min(Number(digits), max));
};

/**
 * 목표 금액·기간·월소득 수정 바텀시트.
 */
export function GoalEditSheet({ open, onOpenChange, initialTargetManwon }: GoalEditSheetProps) {
  const [target, setTarget] = useState(String(initialTargetManwon));
  const [period, setPeriod] = useState("");
  const [monthlySalary, setMonthlySalary] = useState("");
  const [submitError, setSubmitError] = useState<string>();
  const { mutate, isPending } = useUpdateGoal();
  const { data: profile } = useOnboardingProfile();
  const { mutateAsync: patchProfile } = usePatchOnboardingProfile();

  // 시트는 항상 마운트 상태(open 제어)라 useState 초기값이 재오픈 시 반영되지 않는다.
  // 열 때마다 목표 금액·기간·월소득을 최신 프로필 값으로 되돌린다.
  useEffect(() => {
    if (!open) return;
    setTarget(String(initialTargetManwon));
    setSubmitError(undefined);
    setPeriod(profile?.goalPeriodMonths == null ? "" : String(profile.goalPeriodMonths));
    setMonthlySalary(
      profile?.monthlySalaryManwon == null ? "" : String(profile.monthlySalaryManwon),
    );
  }, [open, initialTargetManwon, profile]);

  function submit() {
    const totalTargetManwon = toNullableAmount(target);
    const periodMonths = toNullableAmount(period);
    const monthlySalaryManwon = toMonthlySalary(monthlySalary);

    // 하한은 입력 중에 막지 않으므로 여기서 거른다 — 넘기면 서버가 400으로 되돌린다.
    if (periodMonths != null && periodMonths < MIN_GOAL_PERIOD_MONTHS) {
      setSubmitError(`목표 기간은 ${MIN_GOAL_PERIOD_MONTHS}개월 이상으로 입력해주세요.`);
      return;
    }

    setSubmitError(undefined);
    mutate(
      {
        targetAmountManwon: totalTargetManwon,
        periodMonths,
      },
      {
        onError: () => setSubmitError("저장하지 못했어요. 잠시 후 다시 시도해주세요."),
        onSuccess: async () => {
          if (monthlySalaryManwon != null || periodMonths != null) {
            await patchProfile({
              ...(monthlySalaryManwon != null ? { monthlySalaryManwon } : {}),
              ...(periodMonths != null ? { goalPeriodMonths: periodMonths } : {}),
            });
          }
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <BottomSheet open={open} title="수정" onOpenChange={onOpenChange}>
      <div className="flex flex-col gap-6 px-5 pt-6 pb-8">
        <AmountField
          label="목표 금액"
          inputMode="numeric"
          value={target}
          onChange={(event) => setTarget(clampToMax(event.target.value, MAX_GOAL_TARGET_MANWON))}
        />
        <div className="grid grid-cols-2 gap-2.5">
          <AmountField
            label="목표 기간"
            unit="개월"
            inputMode="numeric"
            value={period}
            maxLength={String(MAX_GOAL_PERIOD_MONTHS).length}
            onChange={(event) => setPeriod(clampToMax(event.target.value, MAX_GOAL_PERIOD_MONTHS))}
          />
          <AmountField
            label="월소득"
            unit="만원"
            inputMode="numeric"
            value={monthlySalary}
            maxLength={String(MAX_MONTHLY_AMOUNT).length}
            onChange={(event) => setMonthlySalary(clampMonthlySalaryInput(event.target.value))}
          />
        </div>
        {submitError ? (
          <p aria-live="polite" className="text-body-b2-500 text-error">
            {submitError}
          </p>
        ) : null}
        <Button size="cta" disabled={isPending} onClick={submit}>
          완료
        </Button>
      </div>
    </BottomSheet>
  );
}
