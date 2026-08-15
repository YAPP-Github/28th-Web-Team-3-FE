"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { formatManwon } from "@/lib/format";
import { onboardingProfileOptions } from "@/lib/queries/onboarding";

function formatBirthDate(value: string | null) {
  return value?.replaceAll("-", ".") ?? "미입력";
}

function formatAmount(value: number | null) {
  return value == null ? "미입력" : formatManwon(value);
}

function formatGoalPeriod(value: number | null) {
  if (value == null) return "미입력";
  if (value <= 12) return "1년 미만";
  if (value <= 24) return "2년 미만";
  return "3년 미만";
}

const PROFILE_FIELDS = [
  ["생년월일", "birthDate"],
  ["월급", "monthlySalaryManwon"],
  ["월 저축액", "monthlySavingManwon"],
  ["현재 순자산", "netWorthManwon"],
  ["서비스를 사용하여 자산을 모으고 싶은 기간", "goalPeriodMonths"],
] as const;

export default function ProfilePage() {
  const { data: profile, isPending, isError } = useQuery(onboardingProfileOptions());

  const values = profile
    ? {
        birthDate: formatBirthDate(profile.birthDate),
        monthlySalaryManwon: formatAmount(profile.monthlySalaryManwon),
        monthlySavingManwon: formatAmount(profile.monthlySavingManwon),
        netWorthManwon: formatAmount(profile.netWorthManwon),
        goalPeriodMonths: formatGoalPeriod(profile.goalPeriodMonths),
      }
    : undefined;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-gray-0">
      <header className="grid h-11 grid-cols-[44px_1fr_44px] items-center px-2.5">
        <Link
          aria-label="뒤로가기"
          className="flex size-11 items-center justify-center rounded-full hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          href="/mypage"
        >
          <ChevronLeft aria-hidden="true" className="size-6" strokeWidth={1.6} />
        </Link>
        <h1 className="text-center text-title-t1-700 text-gray-900">내 정보</h1>
        <Link
          className="flex h-11 items-center justify-center text-body-b2-700 text-blue-500 hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          href="/profile/edit"
        >
          수정
        </Link>
      </header>

      {isPending ? (
        <div
          aria-label="내 정보 불러오는 중"
          className="flex flex-col gap-6 px-5 pt-4"
          role="status"
        >
          {PROFILE_FIELDS.map(([label]) => (
            <div className="flex flex-col gap-1" key={label}>
              <span className="h-5 w-24 animate-pulse rounded bg-gray-50" />
              <span className="h-12 w-full animate-pulse rounded-xl bg-gray-50" />
            </div>
          ))}
        </div>
      ) : null}

      {isError ? (
        <p className="px-5 pt-20 text-center text-body-b2-500 text-gray-500">
          내 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      ) : null}

      {values ? (
        <dl className="flex flex-col gap-6 px-5 pt-4">
          {PROFILE_FIELDS.map(([label, key]) => (
            <div className="flex flex-col gap-1" key={key}>
              <dt className="text-body-b2-500 text-gray-700">{label}</dt>
              <dd className="flex h-12 items-center rounded-xl border border-gray-100 px-4 text-body-b2-500 text-gray-700 tabular-nums">
                {values[key]}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </main>
  );
}
