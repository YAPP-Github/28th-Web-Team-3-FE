"use client";

import type { OnboardingFormValues } from "@repo/schema/onboarding";
import { ButtonGroup, Slider } from "@repo/ui";
import { useRouter } from "next/navigation";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useSaveOnboardingProfile } from "@/app/onboarding/_hooks/use-save-onboarding-profile";

const MAX_GOAL_PERIOD_MONTHS = 36;

function formatGoalPeriod(periodMonths: OnboardingFormValues["goalPeriodMonths"]) {
  if (periodMonths === "" || periodMonths === 0) return "0년";

  const years = Math.floor(periodMonths / 12);
  const months = periodMonths % 12;
  if (years === 0) return `${months}개월`;
  return months === 0 ? `${years}년` : `${years}년 ${months}개월`;
}

export default function InvestmentPeriodOnboardingPage() {
  const router = useRouter();
  const { control, trigger } = useFormContext<OnboardingFormValues>();
  const periodMonths = useWatch({ control, name: "goalPeriodMonths" });
  const { isSaving, saveError, saveProfile } = useSaveOnboardingProfile();

  return (
    <div className="flex min-h-[calc(100dvh-56px)] flex-col px-5 pt-8">
      <section>
        <h1 className="text-pretty text-headline-h2-700 text-black">
          자산을 모으고 싶은
          <br />
          목표기간을 입력해주세요
        </h1>
        <p className="mt-1 text-body-b1-400 text-gray-700">
          목표 기간에 따라 추천 목표 금액이 달라져요
        </p>
        <Controller
          control={control}
          name="goalPeriodMonths"
          render={({ field }) => (
            <div className="mt-12 flex flex-col gap-4">
              <div className="flex h-[50px] flex-col gap-1">
                <p className="text-title-t1-700 text-gray-900">
                  목표기간 {formatGoalPeriod(field.value)}
                </p>
                <p className="text-caption-c1-500 text-gray-500">
                  6개월 단위로 최대 3년까지 설정할 수 있어요.
                </p>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-body-b2-500 text-gray-400">
                  <span>0</span>
                  <span>3년</span>
                </div>
                <Slider
                  className="h-8"
                  max={MAX_GOAL_PERIOD_MONTHS}
                  min={0}
                  step={6}
                  thumbLabels={["목표기간"]}
                  value={[field.value === "" ? 0 : field.value]}
                  onValueChange={([nextPeriodMonths]) => {
                    if (nextPeriodMonths !== undefined) {
                      field.onChange(nextPeriodMonths === 0 ? "" : nextPeriodMonths);
                    }
                  }}
                />
              </div>
            </div>
          )}
        />
      </section>
      {saveError ? (
        <p aria-live="polite" className="mt-auto text-center text-body-b2-500 text-gray-700">
          {saveError}
        </p>
      ) : null}
      <div className="mt-auto pt-8 pb-6">
        <ButtonGroup
          nextDisabled={periodMonths === "" || isSaving}
          nextLabel={isSaving ? "저장 중…" : "다음"}
          onNext={async () => {
            if (periodMonths !== "" && (await trigger("goalPeriodMonths"))) {
              if (await saveProfile({ goalPeriodMonths: periodMonths })) {
                router.replace("/onboarding/result");
              }
            }
          }}
          onPrev={() => router.replace("/onboarding/net")}
        />
      </div>
    </div>
  );
}
