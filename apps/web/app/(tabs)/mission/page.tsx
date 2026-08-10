"use client";

import type { Mission } from "@repo/schema/mission";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { MissionListSkeleton } from "@/app/_components/mission-list-skeleton";
import {
  completeMissionOptions,
  deleteRecommendedMissionOptions,
  missionsOptions,
} from "@/lib/queries/mission";
import { MissionAddMenu } from "./_components/mission-add-menu";
import { MissionCategoryFilter } from "./_components/mission-category-filter";
import { MissionCompleteDialog } from "./_components/mission-complete-dialog";
import { MissionDeleteDialog } from "./_components/mission-delete-dialog";
import { MissionHero } from "./_components/mission-hero";
import { MissionList } from "./_components/mission-list";
import { MISSION_CATEGORY_LABELS, type MissionCategory } from "./constants/mission";
import { calculateProgressPercent, countCompletedMissions, formatWeekDday } from "./lib/format";

export default function MissionPage() {
  const queryClient = useQueryClient();
  const { data: missions, isPending, isError } = useQuery(missionsOptions());
  const completeMission = useMutation(completeMissionOptions(queryClient));
  const deleteMission = useMutation(deleteRecommendedMissionOptions(queryClient));
  const [activeCategory, setActiveCategory] = useState<MissionCategory>("전체");
  const [expandedMissionId, setExpandedMissionId] = useState<string | null>(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [missionToComplete, setMissionToComplete] = useState<Mission | null>(null);
  const [missionToDelete, setMissionToDelete] = useState<Mission | null>(null);
  const [completeError, setCompleteError] = useState<string>();
  const [deleteError, setDeleteError] = useState<string>();

  // 상단 safe-area 밴드는 경로만 보고 미션 히어로 색(gray-50)을 깐다(`lib/safe-area-bands.ts`).
  // 히어로가 없는 로딩·오류 화면도 같은 색으로 시작해야 밴드만 회색인 띠가 다시 생기지 않는다.
  if (isPending) {
    return (
      <main className="flex flex-1 flex-col bg-gray-50">
        <MissionListSkeleton className="px-5 pt-20" count={4} />
      </main>
    );
  }

  // 재조회 실패로는 화면을 내리지 않는다 — react-query가 이전 데이터를 유지한 채 isError를 켠다.
  if (isError && !missions) {
    return (
      <main className="flex flex-1 flex-col bg-gray-50">
        <p className="px-5 pt-20 text-center text-body-b2-500 text-gray-500">
          미션을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      </main>
    );
  }

  function matchesCategory(mission: Mission) {
    return (
      activeCategory === "전체" || MISSION_CATEGORY_LABELS[mission.category] === activeCategory
    );
  }

  const visibleActiveMissions = missions.filter(
    (mission) => mission.status === "ACTIVE" && matchesCategory(mission),
  );
  const visibleCompletedMissions = missions.filter(
    (mission) => mission.status === "COMPLETED" && matchesCategory(mission),
  );

  return (
    <main className="flex flex-1 flex-col bg-gray-0 text-gray-900">
      <MissionHero
        completedCount={countCompletedMissions(missions)}
        ddayLabel={formatWeekDday(missions[0]?.weekEndsAt)}
        percent={calculateProgressPercent(missions)}
      />
      <section className="flex flex-col gap-5 px-5 pt-6">
        <MissionCategoryFilter activeCategory={activeCategory} onChange={setActiveCategory} />
        <MissionList
          expandedMissionId={expandedMissionId}
          completedMissions={visibleCompletedMissions}
          deletingMissionId={deleteMission.isPending ? deleteMission.variables?.missionId : null}
          missions={visibleActiveMissions}
          onComplete={setMissionToComplete}
          onDelete={(mission) => {
            setDeleteError(undefined);
            setMissionToDelete(mission);
          }}
          onToggle={(id) => setExpandedMissionId((expandedId) => (expandedId === id ? null : id))}
        />
      </section>
      <MissionAddMenu
        isOpen={isAddMenuOpen}
        onToggle={() => setIsAddMenuOpen((isOpen) => !isOpen)}
      />
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
      <MissionDeleteDialog
        error={deleteError}
        open={missionToDelete != null}
        pending={deleteMission.isPending}
        onCancel={() => {
          if (deleteMission.isPending) return;
          setDeleteError(undefined);
          setMissionToDelete(null);
        }}
        onConfirm={() => {
          if (!missionToDelete) return;
          setDeleteError(undefined);
          deleteMission.mutate(
            { missionId: missionToDelete.id },
            {
              onError: () =>
                setDeleteError("미션을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요."),
              onSuccess: () => {
                setExpandedMissionId(null);
                setMissionToDelete(null);
              },
            },
          );
        }}
      />
    </main>
  );
}
