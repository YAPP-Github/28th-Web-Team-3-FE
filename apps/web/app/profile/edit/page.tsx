"use client";

import { MAX_MONTHLY_AMOUNT, MAX_NET_WORTH_AMOUNT } from "@repo/schema/onboarding";
import type { OnboardingProfilePatch } from "@repo/schema/onboarding-api";
import { Button, cn, Input } from "@repo/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { SAVE_FAILED_TEXT } from "@/lib/messages";
import { onlyDigits } from "@/lib/number";
import { updateGoalOptions } from "@/lib/queries/goal";
import { onboardingProfileOptions, updateOnboardingProfileOptions } from "@/lib/queries/onboarding";

/**
 * 목표 기간은 프로필과 목표에 따로 저장된다 — 프로필 수정만으로는 목표의 기간·D-day가
 * 그대로다(서버가 목표를 다시 계산하지 않는다). 저장할 때 목표 쪽도 같이 맞춘다.
 */
const GOAL_SYNC_FAILED_TEXT =
  "내 정보는 저장했지만 목표 기간을 바꾸지 못했어요. 잠시 후 다시 시도해 주세요.";

interface ProfileDraft {
  birthDate: string;
  monthlySalaryManwon: string;
  monthlySavingManwon: string;
  netWorthManwon: string;
  goalPeriodMonths: number;
}

const PERIOD_OPTIONS = [
  { label: "1년 미만", months: 12 },
  { label: "2년 미만", months: 24 },
  { label: "3년 미만", months: 36 },
] as const;

function formatBirthDateInput(value: string) {
  const digits = onlyDigits(value).slice(0, 8);
  return [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8)].filter(Boolean).join(".");
}

function toIsoBirthDate(value: string) {
  return /^\d{4}\.\d{2}\.\d{2}$/.test(value) ? value.replaceAll(".", "-") : value;
}

function isValidPastDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  if (year === undefined || month === undefined || day === undefined) return false;

  const date = new Date(Date.UTC(year, month - 1, day));
  const isRealDate =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return isRealDate && date.getTime() < todayUtc;
}

function selectedPeriodOption(periodMonths: number) {
  if (periodMonths <= 12) return 12;
  if (periodMonths <= 24) return 24;
  return 36;
}

function AmountInput({
  id,
  label,
  max,
  value,
  onChange,
}: {
  id: string;
  label: string;
  max: number;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-body-b2-500 text-gray-700" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <Input
          autoComplete="off"
          className="h-12 pr-14 text-body-b2-500 text-gray-700 tabular-nums"
          id={id}
          inputMode="numeric"
          maxLength={String(max).length}
          name={id}
          value={value}
          onChange={(event) => {
            const amount = Math.min(Number(onlyDigits(event.target.value)), max);
            onChange(event.target.value === "" ? "" : String(amount));
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-body-b2-500 text-gray-700"
        >
          만원
        </span>
      </div>
    </div>
  );
}

export default function ProfileEditPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: profile, isPending, isError } = useQuery(onboardingProfileOptions());
  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useMutation(
    updateOnboardingProfileOptions(queryClient),
  );
  const { mutateAsync: updateGoal, isPending: isUpdatingGoal } = useMutation(
    updateGoalOptions(queryClient),
  );
  const [draft, setDraft] = useState<ProfileDraft>();
  // 기간 칩을 실제로 눌렀는지. 목표에 기간을 밀어넣을지 여부가 여기에 달려 있다.
  const [isPeriodEdited, setIsPeriodEdited] = useState(false);
  // 프로필 저장 뒤 목표 동기화만 실패한 경우, 같은 프로필을 다시 저장하지 않는다.
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  useEffect(() => {
    if (!profile || draft) return;
    setDraft({
      birthDate: profile.birthDate?.replaceAll("-", ".") ?? "",
      monthlySalaryManwon:
        profile.monthlySalaryManwon == null ? "" : String(profile.monthlySalaryManwon),
      monthlySavingManwon:
        profile.monthlySavingManwon == null ? "" : String(profile.monthlySavingManwon),
      netWorthManwon: profile.netWorthManwon == null ? "" : String(profile.netWorthManwon),
      goalPeriodMonths: profile.goalPeriodMonths ?? 12,
    });
  }, [draft, profile]);

  function goBack() {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) router.back();
    else router.replace("/profile");
  }

  function editDraft(nextDraft: ProfileDraft) {
    setDraft(nextDraft);
    setIsProfileSaved(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft || !profile) return;

    const birthDate = toIsoBirthDate(draft.birthDate);
    const monthlySalaryManwon = Number(draft.monthlySalaryManwon);
    const monthlySavingManwon = Number(draft.monthlySavingManwon);
    const netWorthManwon = Number(draft.netWorthManwon);

    if (!isValidPastDate(birthDate)) {
      setSubmitError("올바른 생년월일을 입력해주세요.");
      return;
    }
    if (!draft.monthlySalaryManwon || !draft.monthlySavingManwon) {
      setSubmitError("월급과 월 저축액을 입력해주세요.");
      return;
    }
    if (!draft.netWorthManwon) {
      setSubmitError("현재 순자산을 입력해주세요.");
      return;
    }
    if (monthlySavingManwon > monthlySalaryManwon) {
      setSubmitError("월 저축액은 월급보다 클 수 없어요.");
      return;
    }

    const nextProfile: OnboardingProfilePatch = {
      birthDate,
      monthlySalaryManwon,
      monthlySavingManwon,
      netWorthManwon,
      goalPeriodMonths: draft.goalPeriodMonths,
    };

    setSubmitError(undefined);
    if (!isProfileSaved) {
      try {
        await updateProfile(nextProfile);
        setIsProfileSaved(true);
      } catch {
        setSubmitError(SAVE_FAILED_TEXT);
        return;
      }
    }

    // 목표는 온보딩을 확정해야 생긴다 — 진행 중인 사용자에게 보내면 서버가 거절한다.
    // 이 화면에서 기간을 직접 고른 경우에만 목표에 반영한다. 프로필 값과 목표 값을 비교해
    // 보내면, 목표 쪽에서 따로 바꾼 기간을 손대지도 않은 프로필의 옛 값으로 덮어쓴다.
    if (profile.status === "COMPLETED" && isPeriodEdited) {
      try {
        await updateGoal({ targetAmountManwon: null, periodMonths: draft.goalPeriodMonths });
      } catch {
        // 프로필은 이미 저장됐다. 화면에 남겨 두면 완료를 다시 눌러 목표만 재시도할 수 있다.
        setSubmitError(GOAL_SYNC_FAILED_TEXT);
        return;
      }
    }

    router.back();
  }

  return (
    /*
     * 화면 높이를 키보드가 가린 만큼 줄이고, 그 안에서 입력 영역만 스크롤시킨다. 완료 버튼은
     * 스크롤 밖 하단 바에 두어 항상 키보드 바로 위에 붙는다 — 입력 항목이 많아 흐름에 두면
     * 버튼이 화면 아래로 밀려 키보드에 가려졌다.
     */
    <main className="mx-auto flex h-[calc(100dvh-var(--keyboard-inset,0px))] w-full max-w-md flex-col bg-gray-0">
      <header className="grid h-11 grid-cols-[44px_1fr_44px] items-center px-2.5">
        <Button aria-label="뒤로가기" size="icon" variant="ghost" onClick={goBack}>
          <ChevronLeft aria-hidden="true" className="size-6" strokeWidth={1.6} />
        </Button>
        <h1 className="text-center text-title-t1-700 text-gray-900">내 정보 수정</h1>
        <span aria-hidden="true" />
      </header>

      {isPending ? (
        <div aria-label="내 정보 불러오는 중" className="px-5 pt-4" role="status">
          <div className="h-72 animate-pulse rounded-xl bg-gray-50" />
        </div>
      ) : null}

      {isError ? (
        <p className="px-5 pt-20 text-center text-body-b2-500 text-gray-500">
          내 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      ) : null}

      {draft ? (
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={submit}>
          <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 pt-4 pb-6">
            <div className="flex flex-col gap-1">
              <label className="text-body-b2-500 text-gray-700" htmlFor="birth-date">
                생년월일
              </label>
              <Input
                autoComplete="off"
                className="h-12 text-body-b2-500 text-gray-700 tabular-nums"
                id="birth-date"
                inputMode="numeric"
                maxLength={10}
                name="birthDate"
                value={draft.birthDate}
                onChange={(event) =>
                  editDraft({ ...draft, birthDate: formatBirthDateInput(event.target.value) })
                }
              />
            </div>

            <AmountInput
              id="monthly-salary"
              label="월급"
              max={MAX_MONTHLY_AMOUNT}
              value={draft.monthlySalaryManwon}
              onChange={(value) => editDraft({ ...draft, monthlySalaryManwon: value })}
            />
            <AmountInput
              id="monthly-saving"
              label="월 저축액"
              max={MAX_MONTHLY_AMOUNT}
              value={draft.monthlySavingManwon}
              onChange={(value) => editDraft({ ...draft, monthlySavingManwon: value })}
            />
            <AmountInput
              id="net-worth"
              label="현재 순자산"
              max={MAX_NET_WORTH_AMOUNT}
              value={draft.netWorthManwon}
              onChange={(value) => editDraft({ ...draft, netWorthManwon: value })}
            />

            <fieldset className="flex flex-col gap-3">
              <legend className="text-body-b2-500 text-gray-700">
                서비스를 사용하여 자산을 모으고 싶은 기간
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {PERIOD_OPTIONS.map(({ label, months }) => {
                  const selected = selectedPeriodOption(draft.goalPeriodMonths) === months;
                  return (
                    <button
                      aria-pressed={selected}
                      className={cn(
                        "h-12 rounded-xl border text-body-b2-500 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        selected
                          ? "border-blue-500 bg-blue-50 text-gray-700 hover:bg-blue-100"
                          : "border-gray-800 bg-gray-0 text-gray-700 hover:bg-gray-50",
                      )}
                      key={months}
                      type="button"
                      onClick={() => {
                        setIsPeriodEdited(months !== profile?.goalPeriodMonths);
                        editDraft({ ...draft, goalPeriodMonths: months });
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          <div className="shrink-0 bg-gray-0 px-5 pt-2 pb-3">
            {submitError ? (
              <p aria-live="polite" className="pb-3 text-body-b2-500 text-error">
                {submitError}
              </p>
            ) : null}
            <Button pending={isUpdatingProfile || isUpdatingGoal} size="cta" type="submit">
              완료
            </Button>
          </div>
        </form>
      ) : null}
    </main>
  );
}
