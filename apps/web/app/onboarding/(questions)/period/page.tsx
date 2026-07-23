"use client";

import type { OnboardingFormValues } from "@repo/schema";
import { ButtonGroup, OptionGroup, OptionItem } from "@repo/ui";
import { useRouter } from "next/navigation";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { patchOnboardingProfile } from "@/lib/onboarding-api";

const PERIOD_OPTIONS = [6, 12, 18, 24, 30, 36] as const;

export default function InvestmentPeriodOnboardingPage() {
  const router = useRouter();
  const { control, trigger } = useFormContext<OnboardingFormValues>();
  const periodMonths = useWatch({ control, name: "goalPeriodMonths" });

  return (
    <div className="flex min-h-[calc(100dvh-56px)] flex-col px-5 pt-8">
      <section>
        <h1 className="whitespace-pre-line text-headline-h2-700 text-black">
          현재 투자자금의 예상 투자 기간은{"\n"}얼마나 되나요?
        </h1>
        <p className="mt-1 text-body-b1-400 text-gray-700">투자 성향을 파악하기 위한 질문이에요.</p>
        <Controller
          control={control}
          name="goalPeriodMonths"
          render={({ field }) => (
            <OptionGroup
              aria-label="현재 투자자금의 예상 투자 기간은 얼마나 되나요?"
              className="mt-8"
              value={field.value === "" ? "" : String(field.value)}
              onValueChange={(value) => field.onChange(Number(value))}
            >
              {PERIOD_OPTIONS.map((months) => (
                <OptionItem key={months} value={String(months)}>
                  {months % 12 === 0
                    ? `${months / 12}년 정도 예상해요`
                    : `${months}개월 정도 예상해요`}
                </OptionItem>
              ))}
            </OptionGroup>
          )}
        />
      </section>
      <div className="mt-auto pt-8 pb-6">
        <ButtonGroup
          nextDisabled={periodMonths === ""}
          onNext={async () => {
            if (periodMonths !== "" && (await trigger("goalPeriodMonths"))) {
              await patchOnboardingProfile({ goalPeriodMonths: periodMonths });
              router.push("/onboarding/result");
            }
          }}
          onPrev={() => router.push("/onboarding/net")}
        />
      </div>
    </div>
  );
}
