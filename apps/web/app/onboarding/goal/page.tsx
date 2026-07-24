"use client";

import type { OnboardingGoalPlans } from "@repo/schema/onboarding-api";
import { ButtonGroup, OptionGroup, OptionItem } from "@repo/ui";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GoalPlanChart } from "@/app/onboarding/goal/_components/goal-plan-chart";
import { confirmOnboardingGoal, getOnboardingGoalPlans } from "@/lib/onboarding-api";

type GoalPlanCode = "PLAN_1" | "PLAN_2";

const amountFormatter = new Intl.NumberFormat("ko-KR");

function formatAmount(amountManwon: number) {
  return `${amountFormatter.format(amountManwon)}만원`;
}

function calculateIncreasePercent(amountManwon: number, goalPlans: OnboardingGoalPlans) {
  const baseline = goalPlans.monthlySavingManwon * goalPlans.periodMonths;
  return baseline > 0 ? Math.round((amountManwon / baseline) * 100) : 0;
}

export default function OnboardingGoalPage() {
  const router = useRouter();
  const [goalPlans, setGoalPlans] = useState<OnboardingGoalPlans>();
  const [selectedPlan, setSelectedPlan] = useState<GoalPlanCode>();
  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    let active = true;

    getOnboardingGoalPlans()
      .then((nextGoalPlans) => {
        if (!active) return;
        const defaultPlan =
          nextGoalPlans.plans.find((plan) => plan.default)?.plan ?? nextGoalPlans.plans[0]?.plan;
        if (!defaultPlan) {
          setErrorMessage("선택할 수 있는 목표 플랜이 없어요.");
          return;
        }
        setGoalPlans(nextGoalPlans);
        setSelectedPlan(defaultPlan);
      })
      .catch(() => {
        if (active) setErrorMessage("목표 플랜을 불러오지 못했어요. 잠시 후 다시 열어주세요.");
      });

    return () => {
      active = false;
    };
  }, []);

  if (errorMessage && !goalPlans) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-5 text-center text-body-b1-500 text-gray-700">
        {errorMessage}
      </div>
    );
  }

  if (!goalPlans || !selectedPlan) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-body-b1-500 text-gray-500">
        목표 플랜을 불러오고 있어요…
      </div>
    );
  }

  const plan = goalPlans.plans.find((item) => item.plan === selectedPlan);
  if (!plan) return null;

  const increaseMinPercent = calculateIncreasePercent(plan.increaseMinManwon, goalPlans);
  const increaseMaxPercent = calculateIncreasePercent(plan.increaseMaxManwon, goalPlans);

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-gray-0 pt-6">
      <header className="px-5">
        <h1 className="text-pretty text-headline-h2-700 text-gray-900">
          2가지 목표금액을
          <br />
          준비했어요
        </h1>
        <p className="mt-1 text-body-b1-400 text-gray-700">
          난이도를 골라 비교해보세요.
          <br />
          나중에 언제든 바꿀 수 있어요
        </p>
      </header>

      <OptionGroup
        aria-label="목표 플랜"
        className="mx-auto mt-8 flex h-[42px] w-[305px] flex-row gap-0 rounded-full bg-gray-50 p-1"
        value={selectedPlan}
        onValueChange={(value) => setSelectedPlan(value as GoalPlanCode)}
      >
        {goalPlans.plans.map((item, index) => (
          <OptionItem
            className="h-[34px] flex-1 justify-center rounded-full border-0 bg-transparent px-2 text-center text-body-b2-500 text-gray-400 shadow-none transition-colors hover:text-gray-700 data-[state=checked]:border-0 data-[state=checked]:bg-gray-0 data-[state=checked]:text-gray-800"
            key={item.plan}
            value={item.plan}
          >
            {index + 1}안 {item.label}
          </OptionItem>
        ))}
      </OptionGroup>

      <section className="mt-[26px] px-5" aria-labelledby="selected-plan-summary">
        <p className="text-title-t2-700 text-gray-500">
          지금 저축액에서 {increaseMinPercent}~{increaseMaxPercent}% 더 모으기
        </p>
        <div className="mt-1 flex items-center justify-between gap-4">
          <h2 id="selected-plan-summary" className="text-pretty text-headline-h2-700 text-gray-900">
            목표기간동안
            <br />
            <span className="text-blue-500">
              {formatAmount(plan.increaseMinManwon)}~{formatAmount(plan.increaseMaxManwon)}
            </span>
            <br />더 모으기에 도전해요
          </h2>
          <div className="relative h-[44.47px] w-[42.223px] shrink-0" aria-hidden="true">
            <Image alt="" fill sizes="43px" src="/icons/goal-house.svg" />
            <span className="absolute top-[11.7px] left-[13.4px] flex h-[24px] w-[15.8px] flex-col items-center font-bold text-[14px] leading-[16px] text-white">
              W<span className="mt-0.5 h-0.5 w-[15px] bg-white" />
            </span>
          </div>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="goal-chart-title">
        <div className="px-5">
          <h2 id="goal-chart-title" className="text-pretty text-headline-h2-700 text-gray-900">
            기간별 목표 예상 금액
          </h2>
          <p className="mt-1 text-body-b1-400 text-gray-700">
            월 {amountFormatter.format(goalPlans.monthlySavingManwon * 10_000)}원 기준으로
            계산했어요
          </p>
        </div>
        <GoalPlanChart plan={plan} />
        <div className="mx-5 mt-4 rounded-2xl bg-[#f2f5fa] px-5 py-5 text-center">
          <p className="text-title-t1-700 text-gray-900 tabular-nums">
            {plan.card.month}개월 뒤 {formatAmount(plan.card.amountManwon)} 예상
          </p>
          <p className="text-body-b1-500 text-gray-600">이 목표로 시작할까요?</p>
        </div>
      </section>

      {errorMessage ? (
        <p aria-live="polite" className="mt-4 px-5 text-center text-body-b2-500 text-gray-700">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-3 border-gray-400 border-t border-dashed px-5 pt-2 pb-[calc(24px+env(safe-area-inset-bottom))]">
        <ButtonGroup
          nextDisabled={isConfirming}
          nextLabel={isConfirming ? "목표를 설정하고 있어요…" : "이 목표로 시작"}
          prevLabel="다시하기"
          onNext={async () => {
            setIsConfirming(true);
            setErrorMessage(undefined);
            try {
              await confirmOnboardingGoal({ plan: selectedPlan });
              router.replace("/");
            } catch {
              setErrorMessage("목표를 저장하지 못했어요. 잠시 후 다시 시도해주세요.");
            } finally {
              setIsConfirming(false);
            }
          }}
          onPrev={() => router.push("/onboarding/age")}
        />
      </div>
    </div>
  );
}
