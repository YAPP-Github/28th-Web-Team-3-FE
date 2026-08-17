"use client";

import { Button } from "@repo/ui";
import HomeMissionCoin from "@repo/ui/svg/home-mission-coin.svg";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PigboxProgressGauge } from "@/app/(tabs)/_components/pigbox-progress-gauge";
import { missionHistoriesOptions } from "@/lib/queries/mission";
import {
  formatYearMonth,
  getCurrentYearMonth,
  isSameYearMonth,
  shiftYearMonth,
} from "../lib/month";
import { toMissionWeekDisplay } from "../lib/weekly-history";

function MissionHistoryHeader() {
  const router = useRouter();

  function goBack() {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) {
      router.back();
    } else {
      router.replace("/mission");
    }
  }

  return (
    <header className="grid h-11 grid-cols-[44px_1fr_44px] items-center px-2.5">
      <Button aria-label="뒤로가기" size="icon" variant="ghost" onClick={goBack}>
        <ChevronLeft aria-hidden="true" className="size-6" strokeWidth={1.6} />
      </Button>
      <h1 className="text-center text-title-t1-700 text-gray-900">내역</h1>
      <span aria-hidden="true" />
    </header>
  );
}

function MonthSelector({
  nextDisabled,
  label,
  onNext,
  onPrevious,
}: {
  label: string;
  nextDisabled: boolean;
  onNext: () => void;
  onPrevious: () => void;
}) {
  return (
    <nav aria-label="내역 월 선택" className="flex h-[54px] items-center justify-center">
      <Button aria-label="이전 달" size="icon" variant="ghost" onClick={onPrevious}>
        <ChevronLeft aria-hidden="true" className="size-6" strokeWidth={1.6} />
      </Button>
      <p className="min-w-[112px] text-center text-body-b1-500 text-gray-900 tabular-nums">
        {label}
      </p>
      <Button
        aria-label="다음 달"
        disabled={nextDisabled}
        size="icon"
        variant="ghost"
        onClick={onNext}
      >
        <ChevronRight aria-hidden="true" className="size-6" strokeWidth={1.6} />
      </Button>
    </nav>
  );
}

function MissionWeekHistory({ week }: { week: ReturnType<typeof toMissionWeekDisplay> }) {
  const [playRequest, setPlayRequest] = useState(0);

  return (
    <article
      aria-labelledby={`mission-history-week-${week.week}`}
      className="flex flex-col gap-2.5"
    >
      <div className="flex items-center gap-2">
        <h2 className="text-body-b2-500 text-gray-500" id={`mission-history-week-${week.week}`}>
          {week.week}주차
        </h2>
        {week.isCurrentWeek ? (
          <span className="rounded bg-[#e2f8ec] px-1 py-0.5 text-caption-c1-500 text-[#009166]">
            현재 진행 중
          </span>
        ) : null}
      </div>
      {week.state === "no-missions" ? (
        <p className="flex h-[91px] items-center text-body-b1-500 text-gray-500">
          미션이 없었어요.
        </p>
      ) : (
        <div className="mt-2.5 flex h-[91px] items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <strong className="text-headline-h2-700 text-gray-900 tabular-nums">
              {week.progressPercent}% 달성
            </strong>
            <p className="flex items-center gap-1.5 text-body-b2-500 text-gray-900 tabular-nums">
              <HomeMissionCoin aria-hidden="true" className="h-[19px] w-7 shrink-0" />+{" "}
              {week.completedCount}
            </p>
          </div>
          <button
            aria-label={`${week.week}주차 저금통 애니메이션 재생`}
            className="h-[91px] w-[117px] rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            type="button"
            onClick={() => setPlayRequest((request) => request + 1)}
          >
            <PigboxProgressGauge
              animated={false}
              className="-translate-y-[39px]"
              completedCount={week.completedCount}
              playRequest={playRequest}
              progress={week.progressPercent}
            />
          </button>
        </div>
      )}
    </article>
  );
}

function HistoryLoading() {
  return (
    <div aria-label="미션 내역 불러오는 중" className="flex flex-col gap-6 px-5" role="status">
      {Array.from({ length: 3 }, (_, index) => (
        <div className="flex flex-col gap-2.5" key={index}>
          <div className="h-[21px] w-24 animate-pulse rounded bg-gray-50" />
          <div className="flex h-[91px] items-center justify-between">
            <div className="flex flex-col gap-2">
              <span className="h-[34px] w-28 animate-pulse rounded bg-gray-50" />
              <span className="h-[21px] w-16 animate-pulse rounded bg-gray-50" />
            </div>
            <span className="h-[91px] w-[117px] animate-pulse rounded-full bg-gray-50" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MissionHistory() {
  const [currentMonth] = useState(getCurrentYearMonth);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const { data: histories, isError, isPending } = useQuery(missionHistoriesOptions(selectedMonth));

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-gray-0 text-gray-900">
      <MissionHistoryHeader />
      <MonthSelector
        label={formatYearMonth(selectedMonth)}
        nextDisabled={isSameYearMonth(selectedMonth, currentMonth)}
        onNext={() =>
          setSelectedMonth((month) =>
            isSameYearMonth(month, currentMonth) ? month : shiftYearMonth(month, 1),
          )
        }
        onPrevious={() => setSelectedMonth((month) => shiftYearMonth(month, -1))}
      />

      {isPending ? <HistoryLoading /> : null}
      {isError ? (
        <p className="px-5 pt-[127px] text-center text-body-b2-500 text-gray-500">
          미션 내역을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      ) : null}
      {histories?.length ? (
        <section aria-label="주차별 미션 내역" className="flex flex-col gap-6 px-5">
          {histories.map((history) => (
            <MissionWeekHistory key={history.weekStartDate} week={toMissionWeekDisplay(history)} />
          ))}
        </section>
      ) : null}
      {histories && histories.length === 0 ? (
        <p className="px-5 pt-[127px] text-center text-body-b1-500 text-gray-600">
          아직 기록된 미션 내역이 없어요.
        </p>
      ) : null}
    </main>
  );
}
