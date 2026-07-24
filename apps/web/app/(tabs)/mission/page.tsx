"use client";

import type { Mission } from "@repo/schema/mission";
import { useState } from "react";
import { MissionAddMenu } from "./_components/mission-add-menu";
import { MissionCategoryFilter } from "./_components/mission-category-filter";
import { MissionCompleteDialog } from "./_components/mission-complete-dialog";
import { MissionHero } from "./_components/mission-hero";
import { MissionList } from "./_components/mission-list";
import { MISSION_CATEGORY_LABELS, type MissionCategory } from "./constants/mission";
import { calculateProgressPercent, formatWeekDday } from "./lib/format";
import { useCompleteMission, useDeleteRecommendedMission, useMissions } from "./queries";

export default function MissionPage() {
  const { data: missions, isPending, isError } = useMissions();
  const completeMission = useCompleteMission();
  const deleteMission = useDeleteRecommendedMission();
  const [activeCategory, setActiveCategory] = useState<MissionCategory>("전체");
  const [expandedMissionId, setExpandedMissionId] = useState<string | null>(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [missionToComplete, setMissionToComplete] = useState<Mission | null>(null);

  if (isPending) {
    return <p className="px-5 pt-20 text-center text-body-b2-500 text-gray-400">불러오는 중…</p>;
  }

  if (isError) {
    return (
      <p className="px-5 pt-20 text-center text-body-b2-500 text-gray-500">
        미션을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
      </p>
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
          onDelete={(mission) =>
            deleteMission.mutate(
              { missionId: mission.id },
              { onSuccess: () => setExpandedMissionId(null) },
            )
          }
          onToggle={(id) => setExpandedMissionId((expandedId) => (expandedId === id ? null : id))}
        />
      </section>
      <MissionAddMenu
        isOpen={isAddMenuOpen}
        onToggle={() => setIsAddMenuOpen((isOpen) => !isOpen)}
      />
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
    </main>
  );
}
