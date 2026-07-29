import type { Mission } from "@repo/schema/mission";
import { buttonVariants, cn } from "@repo/ui";
import CoinIcon from "@repo/ui/svg/coin.svg";
import { Check, ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { HOME_MISSION_CATEGORIES, type HomeMissionCategory } from "@/app/(tabs)/constants/home";
import { MissionCompleteDialog } from "@/app/(tabs)/mission/_components/mission-complete-dialog";
import { MISSION_CATEGORY_LABELS } from "@/app/(tabs)/mission/constants/mission";
import {
  calculateProgressPercent,
  countCompletedMissions,
  formatWeekDday,
} from "@/app/(tabs)/mission/lib/format";
import { useCompleteMission, useMissions } from "@/app/(tabs)/mission/queries";
import { formatManwon } from "@/app/goal/lib/format";
import { calculateGoalTotalTargetManwon } from "@/app/goal/lib/progress";
import { useGoalStatus } from "@/app/goal/queries";
import { SectionHeader } from "./section-header";

export function WeeklyMissionSection() {
  const { data: missions, isPending, isError } = useMissions();
  const { data: goal } = useGoalStatus();
  const completeMission = useCompleteMission();
  const [category, setCategory] = useState<HomeMissionCategory>("전체");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [missionToComplete, setMissionToComplete] = useState<Mission | null>(null);

  if (isPending) {
    return <p className="px-5 pt-8 text-center text-body-b2-500 text-gray-400">불러오는 중…</p>;
  }

  if (isError) {
    return (
      <p className="px-5 pt-8 text-center text-body-b2-500 text-gray-500">
        미션을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
      </p>
    );
  }

  const activeMissions = missions.filter((mission) => mission.status === "ACTIVE");
  const visibleMissions = activeMissions.filter(
    (mission) => category === "전체" || MISSION_CATEGORY_LABELS[mission.category] === category,
  );
  const hasMissions = activeMissions.length > 0;
  const totalTargetLabel = goal
    ? formatManwon(calculateGoalTotalTargetManwon(goal.totalSavedManwon, goal.targetAmountManwon))
    : "목표";

  return (
    <section className="flex flex-col pt-8">
      <div className="px-5 pb-5">
        <SectionHeader title="이번 주 미션">
          <Link
            aria-label="미션 전체 보기"
            className="rounded-md text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href="/mission"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </Link>
        </SectionHeader>
      </div>

      <MissionProgress
        completedCount={countCompletedMissions(missions)}
        ddayLabel={formatWeekDday(missions[0]?.weekEndsAt)}
        hasMissions={hasMissions}
        percent={calculateProgressPercent(missions)}
      />

      {hasMissions ? (
        <div className="flex flex-col gap-4 px-5 pt-6">
          <fieldset className="flex gap-1.5">
            <legend className="sr-only">홈 미션 카테고리</legend>
            {HOME_MISSION_CATEGORIES.map((item) => (
              <button
                key={item}
                aria-pressed={category === item}
                className={cn(
                  "rounded-lg px-4 py-1.5 text-body-b2-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  category === item ? "bg-gray-800 text-gray-0" : "bg-gray-50 text-gray-400",
                )}
                type="button"
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </fieldset>

          <div className="flex flex-col gap-3">
            {visibleMissions.map((mission) => {
              const isExpanded = expandedId === mission.id;
              return (
                <div
                  key={mission.id}
                  className="flex flex-col gap-3 rounded-xl bg-gray-50 px-3.5 py-3.5"
                >
                  <div className="flex w-full items-center gap-2">
                    <button
                      aria-label="미션 완료"
                      className="flex size-5 shrink-0 items-center justify-center rounded-full border border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      type="button"
                      onClick={() => setMissionToComplete(mission)}
                    >
                      <Check aria-hidden="true" className="size-3 text-gray-400" />
                    </button>
                    <button
                      aria-expanded={isExpanded}
                      className="flex min-w-0 flex-1 items-center gap-2 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      type="button"
                      onClick={() =>
                        setExpandedId((current) => (current === mission.id ? null : mission.id))
                      }
                    >
                      <span className="min-w-0 flex-1 text-body-b1-700 text-gray-900">
                        {mission.title}
                      </span>
                      {isExpanded ? (
                        <ChevronUp aria-hidden="true" className="size-5 shrink-0 text-gray-400" />
                      ) : (
                        <ChevronDown aria-hidden="true" className="size-5 shrink-0 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {isExpanded ? (
                    <p className="pl-7 text-body-b2-500 text-gray-700">
                      <span className="mr-2 rounded bg-blue-100 px-1.5 py-1 text-blue-600">
                        달성 시
                      </span>
                      {mission.savingsLabel}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-12 px-5 pt-8 text-center">
          <p className="text-body-b2-500 text-gray-500">
            미션이 없어요.
            <br />
            절약 미션을 추가하고 달성해보세요.
          </p>
          <Link className={buttonVariants({ size: "cta" })} href="/mission/new">
            {totalTargetLabel} 달성을 위한 미션 추가
          </Link>
        </div>
      )}
      <MissionCompleteDialog
        open={missionToComplete != null}
        pending={completeMission.isPending}
        onCancel={() => setMissionToComplete(null)}
        onConfirm={() => {
          if (!missionToComplete) return;
          completeMission.mutate(
            { source: missionToComplete.source, missionId: missionToComplete.id },
            { onSuccess: () => setMissionToComplete(null) },
          );
        }}
      />
    </section>
  );
}

interface MissionProgressProps {
  ddayLabel: string;
  hasMissions: boolean;
  percent: number;
  /** 완료한 미션 수 — 완료 1건당 코인 1개. */
  completedCount: number;
}

function MissionProgress({
  ddayLabel,
  hasMissions,
  percent,
  completedCount,
}: MissionProgressProps) {
  const progressLabel = hasMissions ? `${percent}% 달성` : "0% 달성";

  return (
    <div className="flex flex-row justify-between bg-gray-50 px-5 py-[10px]">
      <div className="flex flex-col justify-center gap-2">
        <span className="w-fit rounded bg-gray-100 px-2 py-1 text-body-b2-700 text-gray-700">
          {ddayLabel}
        </span>
        <div className="flex flex-col gap-[1px]">
          <strong className="text-title-t1-700 text-gray-900">{progressLabel}</strong>
          <p className="text-caption-c1-500 text-gray-700">미션을 추가하고 달성해보세요!</p>
        </div>
        <span className="flex items-center gap-1 text-body-b2-500 text-gray-800">
          <CoinIcon aria-hidden="true" />+{completedCount}
        </span>
      </div>
      <Image
        alt=""
        aria-hidden="true"
        className="pointer-events-none h-32 w-auto object-contain"
        height={256}
        src="/images/mission/mission-home.webp"
        width={384}
      />
    </div>
  );
}
