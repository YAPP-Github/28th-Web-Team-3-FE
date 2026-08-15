"use client";

import { Button, ButtonGroup } from "@repo/ui";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { OnboardingPageSkeleton } from "@/app/onboarding/_components/onboarding-page-skeleton";
import { getResidentialAreaLabel } from "@/app/onboarding/constants/residential-areas";
import { formatBirthDate, formatGoalPeriod } from "@/app/onboarding/lib/format";
import { formatManwon } from "@/lib/format";
import { onboardingProfileOptions } from "@/lib/queries/onboarding";
import { ReviewField } from "./-components/review-field";

export default function OnboardingCheckPage() {
  const router = useRouter();
  const { data: profile, isError } = useQuery(onboardingProfileOptions());

  if (isError && !profile) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-5 text-body-b1-500 text-gray-700">
        설문 내용을 불러오지 못했어요. 잠시 후 페이지를 다시 열어주세요.
      </div>
    );
  }

  if (!profile) {
    return <OnboardingPageSkeleton label="설문 내용을 불러오는 중" />;
  }

  const isComplete =
    profile.birthDate !== null &&
    profile.address !== null &&
    profile.monthlySalaryManwon !== null &&
    profile.monthlySavingManwon !== null &&
    profile.netWorthManwon !== null &&
    profile.goalPeriodMonths !== null;

  return (
    <div className="flex min-h-dvh flex-col bg-gray-0">
      <header className="flex h-11 items-center justify-between px-2.5">
        <Button
          aria-label="이전 단계"
          size="icon"
          variant="ghost"
          onClick={() => router.push("/onboarding/period")}
        >
          <ChevronLeft aria-hidden="true" className="size-6" strokeWidth="1.6" />
        </Button>
        <div aria-hidden="true" className="size-11" />
      </header>

      <section className="px-5 pt-5">
        <h1 className="text-pretty text-headline-h2-700 text-black">
          선택하신 설문 내용을
          <br />
          확인해 주세요
        </h1>

        <div className="mt-6 flex flex-col gap-6">
          <ReviewField
            id="review-birth-date"
            label="생년월일이 어떻게 되시나요?"
            value={profile.birthDate ? formatBirthDate(profile.birthDate) : "입력되지 않음"}
          />
          <ReviewField
            id="review-address"
            label="거주지역이 어디이신가요?"
            value={profile.address ? getResidentialAreaLabel(profile.address) : "입력되지 않음"}
          />
          <ReviewField
            id="review-monthly-salary"
            label="월급은 어느 정도인가요?"
            value={
              profile.monthlySalaryManwon === null
                ? "입력되지 않음"
                : formatManwon(profile.monthlySalaryManwon)
            }
          />
          <ReviewField
            id="review-monthly-saving"
            label="월 저축액은 어느 정도인가요?"
            value={
              profile.monthlySavingManwon === null
                ? "입력되지 않음"
                : formatManwon(profile.monthlySavingManwon)
            }
          />
          <ReviewField
            id="review-net-worth"
            label="현재 순자산은 어느 정도 인가요?"
            value={
              profile.netWorthManwon === null
                ? "입력되지 않음"
                : formatManwon(profile.netWorthManwon)
            }
          />
          <ReviewField
            id="review-goal-period"
            label="서비스를 사용하여 자산을 모으고 싶은 기간을 입력해주세요."
            value={
              profile.goalPeriodMonths === null
                ? "입력되지 않음"
                : formatGoalPeriod(profile.goalPeriodMonths)
            }
          />
        </div>
      </section>

      <div className="mt-auto px-5 pt-2 pb-6">
        <ButtonGroup
          nextDisabled={!isComplete}
          nextLabel="완료"
          onNext={() => router.push("/onboarding/result")}
          onPrev={() => router.push("/onboarding/period")}
        />
      </div>
    </div>
  );
}
