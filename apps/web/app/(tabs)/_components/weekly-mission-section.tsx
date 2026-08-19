import type { Mission } from "@repo/schema/mission";
import { buttonVariants, cn, Skeleton } from "@repo/ui";
import HomeMissionCoin from "@repo/ui/svg/home-mission-coin.svg";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createColumnHelper,
  createPaginatedRowModel,
  rowPaginationFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HOME_MISSION_CATEGORIES, type HomeMissionCategory } from "@/app/(tabs)/constants/home";
import { MissionCompleteDialog } from "@/app/(tabs)/mission/_components/mission-complete-dialog";
import { MISSION_CATEGORY_VALUES } from "@/app/(tabs)/mission/constants/mission";
import {
  calculateProgressPercent,
  countCompletedMissions,
  formatSavedWon,
  formatWeekDday,
  sumCompletedSavingsWon,
} from "@/app/(tabs)/mission/lib/format";
import { calculateGoalTotalTargetManwon } from "@/app/goal/lib/progress";
import { hasStartedMissionCreation } from "@/app/mission/new/utils/mission-creation-history";
import { formatManwon } from "@/lib/format";
import { goalStatusOptions } from "@/lib/queries/goal";
import { completeMissionOptions, missionsOptions } from "@/lib/queries/mission";
import { HomeMissionSectionSkeleton } from "./home-mission-section.skeleton";
import { PigboxProgressGauge } from "./pigbox-progress-gauge";

const HOME_MISSION_PAGE_SIZE = 3;
const EMPTY_MISSIONS: Mission[] = [];
const HOME_MISSION_TABLE_FEATURES = tableFeatures({
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});
const missionColumnHelper = createColumnHelper<typeof HOME_MISSION_TABLE_FEATURES, Mission>();
const HOME_MISSION_COLUMNS = missionColumnHelper.columns([
  missionColumnHelper.accessor("id", { header: "미션" }),
]);

export function WeeklyMissionSection() {
  const queryClient = useQueryClient();
  const { data: missions, isPending, isError } = useQuery(missionsOptions());
  const { data: goal } = useQuery(goalStatusOptions());
  const completeMission = useMutation(completeMissionOptions(queryClient));
  const [category, setCategory] = useState<HomeMissionCategory>("전체");
  const {
    data: categoryMissions,
    isPending: isCategoryPending,
    isError: isCategoryError,
    isPlaceholderData,
  } = useQuery(
    missionsOptions({
      status: "ACTIVE",
      category: MISSION_CATEGORY_VALUES[category] ?? undefined,
    }),
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [missionToComplete, setMissionToComplete] = useState<Mission | null>(null);
  const [completeError, setCompleteError] = useState<string>();
  // 구버전 네이티브 셸에는 새 bridge handler가 없을 수 있다. 이력 조회가 타임아웃돼도
  // 홈의 기본 추천 CTA를 바로 제공하고, 지원되는 셸에서만 결과에 따라 두 CTA로 확장한다.
  const [hasStartedCreation, setHasStartedCreation] = useState<boolean | null>(null);

  useEffect(() => {
    void hasStartedMissionCreation().then(setHasStartedCreation);
  }, []);
  const missionTable = useTable({
    features: HOME_MISSION_TABLE_FEATURES,
    columns: HOME_MISSION_COLUMNS,
    data: categoryMissions ?? EMPTY_MISSIONS,
    getRowId: (mission) => mission.id,
    initialState: { pagination: { pageIndex: 0, pageSize: HOME_MISSION_PAGE_SIZE } },
  });

  if (isPending || isCategoryPending) {
    return <HomeMissionSectionSkeleton />;
  }

  // 재조회 실패로는 화면을 내리지 않는다 — react-query가 이전 데이터를 유지한 채 isError를 켠다.
  if (isError && !missions) {
    return (
      <p className="px-5 pt-8 text-center text-body-b2-500 text-gray-500">
        미션을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
      </p>
    );
  }

  if (isCategoryError && !categoryMissions) {
    return (
      <p className="px-5 pt-8 text-center text-body-b2-500 text-gray-500">
        미션을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
      </p>
    );
  }

  const activeMissions = missions.filter((mission) => mission.status === "ACTIVE");
  const pagedMissions = missionTable.getRowModel().rows.map((row) => row.original);
  const totalPages = missionTable.getPageCount();
  const currentPage = missionTable.state.pagination.pageIndex;
  const hasMissions = activeMissions.length > 0;
  const completedCount = countCompletedMissions(missions);
  const progressPercent = calculateProgressPercent(missions);
  const totalTargetLabel = goal
    ? formatManwon(calculateGoalTotalTargetManwon(goal.totalSavedManwon, goal.targetAmountManwon))
    : "목표";

  const missionActions = hasStartedCreation ? (
    <div className="flex w-full gap-2.5">
      <Link
        className={cn(
          buttonVariants({ size: "cta" }),
          "flex-1 bg-gray-700 text-gray-0 hover:bg-gray-800",
        )}
        href="/mission/new/manual"
      >
        직접 입력
      </Link>
      <Link
        className={cn(
          buttonVariants({ size: "cta" }),
          "flex-1 bg-gray-700 text-gray-0 hover:bg-gray-800",
        )}
        href="/mission/new"
      >
        추천받기
      </Link>
    </div>
  ) : (
    <Link
      className={cn(
        buttonVariants({ size: "cta" }),
        "w-full bg-gray-700 text-gray-0 hover:bg-gray-800",
      )}
      href="/mission/new"
    >
      {totalTargetLabel} 달성을 위한 미션 추천 받기
    </Link>
  );

  return (
    <section className="flex flex-col px-5">
      <MissionSummary
        completedCount={completedCount}
        ddayLabel={formatWeekDday(missions[0]?.weekEndsAt)}
        percent={progressPercent}
        savedWon={sumCompletedSavingsWon(missions)}
      />

      {hasMissions ? (
        <div className="flex flex-col gap-4 pt-3">
          <fieldset className="flex gap-1.5 overflow-hidden">
            <legend className="sr-only">홈 미션 카테고리</legend>
            {HOME_MISSION_CATEGORIES.map((item) => (
              <button
                key={item}
                aria-pressed={category === item}
                className={cn(
                  "w-fit shrink-0 rounded-lg px-4 py-1.5 text-body-b2-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  category === item ? "bg-gray-800 text-gray-0" : "bg-gray-50 text-gray-300",
                )}
                type="button"
                onClick={() => {
                  missionTable.setPageIndex(0);
                  setCategory(item);
                }}
              >
                {item}
              </button>
            ))}
          </fieldset>

          <div aria-busy={isPlaceholderData} className="flex flex-col gap-3">
            {pagedMissions.map((mission) => (
              <HomeMissionCard
                key={mission.id}
                expanded={expandedId === mission.id}
                mission={mission}
                onComplete={() => setMissionToComplete(mission)}
                onToggle={() =>
                  setExpandedId((current) => (current === mission.id ? null : mission.id))
                }
              />
            ))}
          </div>

          {totalPages > 1 ? (
            <nav aria-label="홈 미션 페이지" className="flex items-center justify-center gap-1">
              <button
                aria-label="이전 미션 페이지"
                className="text-gray-500 disabled:text-gray-100"
                disabled={isPlaceholderData || !missionTable.getCanPreviousPage()}
                type="button"
                onClick={() => missionTable.previousPage()}
              >
                <ChevronLeft aria-hidden="true" className="size-5" />
              </button>
              <span className="text-body-b2-500 text-gray-600">
                {currentPage + 1}/{totalPages}
              </span>
              <button
                aria-label="다음 미션 페이지"
                className="text-gray-500 disabled:text-gray-100"
                disabled={isPlaceholderData || !missionTable.getCanNextPage()}
                type="button"
                onClick={() => missionTable.nextPage()}
              >
                <ChevronRight aria-hidden="true" className="size-5" />
              </button>
            </nav>
          ) : null}
        </div>
      ) : hasStartedCreation === null ? (
        <Skeleton
          className="mt-8 h-[52px] w-full rounded-xl bg-gray-100"
          data-slot="mission-creation-history-skeleton"
        />
      ) : (
        <div className="flex flex-col gap-12 pt-8 text-center">
          <p className="text-body-b2-500 text-gray-600">
            미션이 없어요.
            <br />
            절약 미션을 추가하고 달성해보세요.
          </p>
          {missionActions}
        </div>
      )}
      <MissionCompleteDialog
        error={completeError}
        open={missionToComplete != null}
        pending={completeMission.isPending}
        onCancel={() => {
          setCompleteError(undefined);
          setMissionToComplete(null);
        }}
        onConfirm={() => {
          if (!missionToComplete) return;
          setCompleteError(undefined);
          completeMission.mutate(
            { source: missionToComplete.source, missionId: missionToComplete.id },
            {
              onError: () =>
                setCompleteError("완료 처리하지 못했어요. 잠시 후 다시 시도해 주세요."),
              onSuccess: () => setMissionToComplete(null),
            },
          );
        }}
      />
    </section>
  );
}

interface MissionSummaryProps {
  completedCount: number;
  ddayLabel: string;
  percent: number;
  savedWon: number;
}

function MissionSummary({ completedCount, ddayLabel, percent, savedWon }: MissionSummaryProps) {
  return (
    <div className="relative h-[130px]">
      <header className="relative z-10 flex h-8 items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-title-t2-700 text-gray-900">이번 주 미션</h2>
          <span className="rounded bg-gray-50 px-2 py-0.5 text-body-b2-700 text-gray-700">
            {ddayLabel}
          </span>
        </div>
        <Link
          aria-label="미션 전체 보기"
          className="flex h-8 items-center rounded-md pl-2 text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href="/mission"
        >
          <ChevronRight aria-hidden="true" className="size-5" />
        </Link>
      </header>
      <div className="absolute top-12 left-0 z-10 flex flex-col gap-2">
        <strong className="text-title-t1-700 text-gray-900">{percent}% 달성</strong>
        <p className="flex items-center gap-1.5 text-body-b2-500 text-gray-900">
          <HomeMissionCoin aria-hidden="true" className="h-[19px] w-7 shrink-0" />약{" "}
          {formatSavedWon(savedWon)} 절약했어요
        </p>
      </div>
      <PigboxProgressGauge
        className="absolute top-0 right-0"
        completedCount={completedCount}
        progress={percent}
      />
    </div>
  );
}

interface HomeMissionCardProps {
  expanded: boolean;
  mission: Mission;
  onComplete: () => void;
  onToggle: () => void;
}

function HomeMissionCard({ expanded, mission, onComplete, onToggle }: HomeMissionCardProps) {
  const savingsLabel = mission.savingsLabel ?? "예상 절약 금액이 없는 직접 추가 미션이에요.";

  return (
    <article className="flex flex-col gap-3 rounded-xl bg-gray-10 p-3.5">
      <div className="flex w-full items-center gap-2">
        <button
          aria-label="미션 완료"
          className="flex size-5 shrink-0 items-center justify-center rounded-full border border-gray-400 bg-gray-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          type="button"
          onClick={onComplete}
        >
          <Check aria-hidden="true" className="size-3 text-gray-400" />
        </button>
        <button
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          type="button"
          onClick={onToggle}
        >
          <span className="min-w-0 flex-1 text-body-b2-700 text-gray-900">{mission.title}</span>
          {expanded ? (
            <ChevronUp aria-hidden="true" className="size-5 shrink-0 text-gray-400" />
          ) : (
            <ChevronDown aria-hidden="true" className="size-5 shrink-0 text-gray-400" />
          )}
        </button>
      </div>
      {expanded ? (
        <div className="flex items-start gap-3 pl-7">
          <span className="shrink-0 rounded bg-blue-100 px-1.5 py-1 text-caption-c1-700 text-blue-600">
            달성 시
          </span>
          <p className="min-w-0 flex-1 text-body-b2-500 text-gray-600">{savingsLabel}</p>
        </div>
      ) : null}
    </article>
  );
}
