"use client";

import { MAX_MONTHLY_AMOUNT } from "@repo/schema";
import { AmountField, BottomSheet, Button } from "@repo/ui";
import { useEffect, useState } from "react";
import { getOnboardingProfile, patchOnboardingProfile } from "@/lib/onboarding";
import { calculateAdditionalTargetManwon } from "../lib/progress";
import { useUpdateGoal } from "../queries";

interface GoalEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSavedManwon: number;
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

/**
 * 목표 금액·기간·월소득 수정 바텀시트.
 * 화면은 전체 목표금액을 입력받고, 목표 API에는 현재 저축액을 뺀 추가 목표액으로 환산해 보낸다.
 */
export function GoalEditSheet({
  open,
  onOpenChange,
  currentSavedManwon,
  initialTargetManwon,
}: GoalEditSheetProps) {
  const [target, setTarget] = useState(String(initialTargetManwon));
  const [period, setPeriod] = useState("");
  const [monthlySalary, setMonthlySalary] = useState("");
  const { mutate, isPending } = useUpdateGoal();

  // 시트는 항상 마운트 상태(open 제어)라 useState 초기값이 재오픈 시 반영되지 않는다.
  // 열 때마다 목표 금액은 최신값으로, 기간은 빈칸(미변경)으로 되돌린다.
  useEffect(() => {
    if (open) {
      setTarget(String(initialTargetManwon));
      setPeriod("");
      setMonthlySalary("");
      getOnboardingProfile()
        .then((profile) => {
          setPeriod(profile.goalPeriodMonths == null ? "" : String(profile.goalPeriodMonths));
          setMonthlySalary(
            profile.monthlySalaryManwon == null ? "" : String(profile.monthlySalaryManwon),
          );
        })
        .catch(() => {
          setPeriod("");
          setMonthlySalary("");
        });
    }
  }, [open, initialTargetManwon]);

  function submit() {
    const totalTargetManwon = toNullableAmount(target);
    const periodMonths = toNullableAmount(period);
    const monthlySalaryManwon = toMonthlySalary(monthlySalary);

    mutate(
      {
        targetAmountManwon:
          totalTargetManwon == null
            ? null
            : calculateAdditionalTargetManwon(totalTargetManwon, currentSavedManwon),
        periodMonths,
      },
      {
        onSuccess: async () => {
          if (monthlySalaryManwon != null || periodMonths != null) {
            await patchOnboardingProfile({
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
          onChange={(event) => setTarget(onlyDigits(event.target.value))}
        />
        <div className="grid grid-cols-2 gap-2.5">
          <AmountField
            label="목표 기간"
            unit="개월"
            inputMode="numeric"
            value={period}
            onChange={(event) => setPeriod(onlyDigits(event.target.value))}
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
        <Button size="cta" disabled={isPending} onClick={submit}>
          완료
        </Button>
      </div>
    </BottomSheet>
  );
}
