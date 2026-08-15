"use client";

import {
  MAX_ONBOARDING_MONTHLY_TARGET_MANWON,
  type OnboardingProfile,
} from "@repo/schema/onboarding-api";
import { Button, ButtonGroup, Slider } from "@repo/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isOnboardingAlreadyCompletedError } from "@/api/onboarding";
import { OnboardingPageSkeleton } from "@/app/onboarding/_components/onboarding-page-skeleton";
import { isAddressConfirmed } from "@/app/onboarding/lib/address-confirmation";
import { formatManwon } from "@/lib/format";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { currentUserOptions } from "@/lib/queries/auth";
import { confirmOnboardingGoalOptions, onboardingProfileOptions } from "@/lib/queries/onboarding";
import { AnimatedNumber } from "./_components/animated-number";

interface GoalReadyProfile {
  monthlySalaryManwon: number;
  monthlySavingManwon: number;
  netWorthManwon: number;
  goalPeriodMonths: number;
}

interface MonthlyTargetDraft {
  userId: number;
  profileFingerprint: string;
  monthlyTargetManwon: number;
}

const MONTHLY_TARGET_DRAFT_STORAGE_KEY = "onboarding:monthly-target-draft";

function getGoalReadyProfile(profile: OnboardingProfile): GoalReadyProfile | null {
  if (
    profile.birthDate === null ||
    profile.address === null ||
    profile.monthlySalaryManwon === null ||
    profile.monthlySavingManwon === null ||
    profile.netWorthManwon === null ||
    profile.goalPeriodMonths === null
  ) {
    return null;
  }

  return {
    monthlySalaryManwon: profile.monthlySalaryManwon,
    monthlySavingManwon: profile.monthlySavingManwon,
    netWorthManwon: profile.netWorthManwon,
    goalPeriodMonths: profile.goalPeriodMonths,
  };
}

function getMaxMonthlyTarget(currentMonthlySaving: number, monthlySalary: number): number {
  return Math.min(
    MAX_ONBOARDING_MONTHLY_TARGET_MANWON,
    monthlySalary,
    Math.floor(currentMonthlySaving * 1.5),
  );
}

function getDefaultMonthlyTarget(currentMonthlySaving: number, monthlySalary: number): number {
  const recommendedTarget = Math.round(currentMonthlySaving * 1.15);
  return Math.min(getMaxMonthlyTarget(currentMonthlySaving, monthlySalary), recommendedTarget);
}

function getProfileFingerprint({
  monthlySalaryManwon,
  monthlySavingManwon,
  netWorthManwon,
  goalPeriodMonths,
}: GoalReadyProfile) {
  const source = `${monthlySalaryManwon}:${monthlySavingManwon}:${netWorthManwon}:${goalPeriodMonths}`;
  let hash = 2_166_136_261;

  for (const character of source) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16_777_619);
  }

  return (hash >>> 0).toString(36);
}

function readMonthlyTargetDraft(
  { monthlySalaryManwon, monthlySavingManwon, netWorthManwon, goalPeriodMonths }: GoalReadyProfile,
  userId: number,
): number | null {
  try {
    const storedDraft = localStorage.getItem(MONTHLY_TARGET_DRAFT_STORAGE_KEY);
    if (!storedDraft) return null;

    const draft = JSON.parse(storedDraft) as Partial<MonthlyTargetDraft>;
    const maxMonthlyTarget = getMaxMonthlyTarget(monthlySavingManwon, monthlySalaryManwon);
    const isCurrentProfile =
      draft.userId === userId &&
      draft.profileFingerprint ===
        getProfileFingerprint({
          monthlySalaryManwon,
          monthlySavingManwon,
          netWorthManwon,
          goalPeriodMonths,
        });
    const monthlyTargetManwon = draft.monthlyTargetManwon;
    const isValidTarget =
      typeof monthlyTargetManwon === "number" &&
      Number.isInteger(monthlyTargetManwon) &&
      monthlyTargetManwon >= monthlySavingManwon &&
      monthlyTargetManwon <= maxMonthlyTarget;

    if (isCurrentProfile && isValidTarget) return monthlyTargetManwon;
    localStorage.removeItem(MONTHLY_TARGET_DRAFT_STORAGE_KEY);
  } catch {
    // 손상된 값이거나 저장소 접근이 막힌 환경이면 기본 추천값을 사용한다.
  }

  return null;
}

function saveMonthlyTargetDraft(draft: MonthlyTargetDraft) {
  try {
    localStorage.setItem(MONTHLY_TARGET_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // 저장 공간을 사용할 수 없어도 현재 화면의 목표 설정은 계속할 수 있다.
  }
}

function clearMonthlyTargetDraft() {
  try {
    localStorage.removeItem(MONTHLY_TARGET_DRAFT_STORAGE_KEY);
  } catch {
    // 목표 확정 자체는 로컬 저장소 상태와 무관하게 완료한다.
  }
}

function OnboardingGoalResult({
  userId,
  monthlySalaryManwon,
  monthlySavingManwon,
  netWorthManwon,
  goalPeriodMonths,
}: GoalReadyProfile & { userId: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutateAsync: confirmGoal, isPending } = useMutation(
    confirmOnboardingGoalOptions(queryClient),
  );
  const [monthlyTargetManwon, setMonthlyTargetManwon] = useState(() =>
    getDefaultMonthlyTarget(monthlySavingManwon, monthlySalaryManwon),
  );
  const [isDraftHydrated, setIsDraftHydrated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const debouncedMonthlyTargetManwon = useDebounce(monthlyTargetManwon, 300);
  const maxMonthlyTarget = getMaxMonthlyTarget(monthlySavingManwon, monthlySalaryManwon);
  const monthlyIncrease = monthlyTargetManwon - monthlySavingManwon;
  const additionalSavings = monthlyTargetManwon * goalPeriodMonths;
  const expectedTotal = netWorthManwon + additionalSavings;

  const goBackToCheck = () => router.replace("/onboarding/check");

  useEffect(() => {
    setMonthlyTargetManwon(
      readMonthlyTargetDraft(
        { monthlySalaryManwon, monthlySavingManwon, netWorthManwon, goalPeriodMonths },
        userId,
      ) ?? getDefaultMonthlyTarget(monthlySavingManwon, monthlySalaryManwon),
    );
    setIsDraftHydrated(true);
  }, [goalPeriodMonths, monthlySalaryManwon, monthlySavingManwon, netWorthManwon, userId]);

  useEffect(() => {
    if (!isDraftHydrated || debouncedMonthlyTargetManwon !== monthlyTargetManwon) return;

    saveMonthlyTargetDraft({
      userId,
      profileFingerprint: getProfileFingerprint({
        monthlySalaryManwon,
        monthlySavingManwon,
        netWorthManwon,
        goalPeriodMonths,
      }),
      monthlyTargetManwon: debouncedMonthlyTargetManwon,
    });
  }, [
    debouncedMonthlyTargetManwon,
    goalPeriodMonths,
    isDraftHydrated,
    monthlySalaryManwon,
    monthlySavingManwon,
    monthlyTargetManwon,
    netWorthManwon,
    userId,
  ]);

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-gray-0 pb-[126px]">
      <header className="flex h-11 items-center px-2.5">
        <Button
          aria-label="이전 단계"
          disabled={isPending}
          size="icon"
          variant="ghost"
          onClick={goBackToCheck}
        >
          <ChevronLeft aria-hidden="true" className="size-6" strokeWidth="1.6" />
        </Button>
      </header>

      <main className="flex flex-col gap-8 px-5 pt-5">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-headline-h2-700 text-gray-900">얼마를 목표로 할까요?</h1>
            <p className="text-body-b1-500 text-gray-700">
              매달 모을 금액을 정하면 목표 금액이 만들어져요.
            </p>
          </div>

          <section className="flex flex-col items-center gap-2.5 rounded-2xl bg-gray-10 px-4 py-6 text-center">
            <div className="flex flex-col items-center">
              <h2 className="text-title-t2-700 text-blue-600">
                {goalPeriodMonths}개월 뒤 목표 금액
              </h2>
              <p className="font-bold text-[32px] leading-[38px] text-gray-900 tabular-nums">
                <AnimatedNumber format={formatManwon} value={expectedTotal} />
              </p>
            </div>
            <p className="text-body-b2-500 text-gray-500">
              현재 순자산 {formatManwon(netWorthManwon)} + 월 저축액{" "}
              <AnimatedNumber format={formatManwon} value={monthlyTargetManwon} /> x{" "}
              {goalPeriodMonths}개월
            </p>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-6" aria-labelledby="monthly-goal-title">
            <div className="flex flex-col gap-1">
              <h2 id="monthly-goal-title" className="text-title-t1-700 text-gray-900">
                매달 모을 금액 <AnimatedNumber format={formatManwon} value={monthlyTargetManwon} />
              </h2>
            </div>

            <div className="flex flex-col">
              <Slider
                className="h-8"
                max={maxMonthlyTarget}
                min={monthlySavingManwon}
                step={1}
                thumbLabels={["매달 모을 금액"]}
                value={[monthlyTargetManwon]}
                onValueChange={([nextTarget]) => {
                  if (nextTarget !== undefined) setMonthlyTargetManwon(nextTarget);
                }}
              />
              <div className="flex justify-between gap-4 text-body-b2-500 text-gray-400">
                <span>현재 저축액 {formatManwon(monthlySavingManwon)}</span>
                <span>최대 {formatManwon(maxMonthlyTarget)}</span>
              </div>
            </div>
          </section>

          <section className="flex items-start justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#e6ebff] to-[#e2f8ff] px-5 py-4 text-center">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-blue-500" />
            {monthlyIncrease > 0 ? (
              <p className="text-body-b1-500 text-gray-800">
                현재 저축액에서 매달 더 모으는{" "}
                <strong className="text-body-b1-700">
                  <AnimatedNumber format={formatManwon} value={monthlyIncrease} />
                </strong>
                은<br />
                맞춤 미션으로 아끼모와 함께해요.
              </p>
            ) : (
              <p className="text-body-b1-500 text-gray-800">
                현재 저축액을 꾸준히 모을 수 있도록
                <br />
                맞춤 미션으로 아끼모가 함께할게요.
              </p>
            )}
          </section>

          {errorMessage ? (
            <p aria-live="polite" className="text-center text-body-b2-500 text-gray-700">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-md bg-gray-0 px-5 pt-2 pb-6">
        <ButtonGroup
          nextLabel="이 목표로 시작하기"
          nextPending={isPending}
          onNext={async () => {
            setErrorMessage(undefined);
            try {
              await confirmGoal({ plan: "PLAN_1", monthlySavingManwon: monthlyTargetManwon });
              clearMonthlyTargetDraft();
              router.replace("/");
            } catch (error) {
              if (isOnboardingAlreadyCompletedError(error)) {
                clearMonthlyTargetDraft();
                router.replace("/");
                return;
              }
              setErrorMessage("목표를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
            }
          }}
          onPrev={goBackToCheck}
        />
      </div>
    </div>
  );
}

export default function OnboardingResultPage() {
  const router = useRouter();
  const { data: profile, isError } = useQuery(onboardingProfileOptions());
  const { data: currentUser, isError: isCurrentUserError } = useQuery(currentUserOptions());
  const hasConfirmedAddress =
    profile && currentUser ? isAddressConfirmed(profile.address, currentUser.userId) : undefined;

  useEffect(() => {
    if (hasConfirmedAddress === false) router.replace("/onboarding/address");
  }, [hasConfirmedAddress, router]);

  if ((isError && !profile) || (isCurrentUserError && !currentUser)) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-5 text-center text-body-b1-500 text-gray-700">
        결과를 불러오지 못했어요. 잠시 후 페이지를 다시 열어주세요.
      </div>
    );
  }

  if (!profile || !currentUser || hasConfirmedAddress === false) {
    return <OnboardingPageSkeleton label="결과를 불러오는 중" />;
  }

  const goalReadyProfile = getGoalReadyProfile(profile);
  if (!goalReadyProfile) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-5 text-center">
        <p className="text-body-b1-500 text-gray-700">완료하지 않은 설문 항목이 있어요.</p>
        <Button size="lg" onClick={() => router.replace("/onboarding/check")}>
          설문 확인으로 돌아가기
        </Button>
      </div>
    );
  }

  return <OnboardingGoalResult {...goalReadyProfile} userId={currentUser.userId} />;
}
