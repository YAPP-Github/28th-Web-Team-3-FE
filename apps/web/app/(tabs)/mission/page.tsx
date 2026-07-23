"use client";

import { useEffect, useState } from "react";
import { getMissionSuggestionsById } from "@/app/mission/constants/mission-creation";
import { MissionAddMenu } from "./_components/mission-add-menu";
import { MissionCategoryFilter } from "./_components/mission-category-filter";
import { MissionHero } from "./_components/mission-hero";
import { MissionList } from "./_components/mission-list";
import {
  ACTIVE_MISSIONS,
  COMPLETED_MISSIONS,
  type Mission,
  type MissionCategory,
} from "./constants/mission";

export default function MissionPage() {
  const [activeCategory, setActiveCategory] = useState<MissionCategory>("전체");
  const [expandedMissionId, setExpandedMissionId] = useState<string | null>(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [activeMissions, setActiveMissions] = useState(ACTIVE_MISSIONS);
  const visibleActiveMissions = activeMissions.filter(
    (mission) => activeCategory === "전체" || mission.category === activeCategory,
  );
  const visibleCompletedMissions = COMPLETED_MISSIONS.filter(
    (mission) => activeCategory === "전체" || mission.category === activeCategory,
  );

  useEffect(() => {
    const missionIds =
      new URLSearchParams(window.location.search).get("addedMissionIds")?.split(",") ?? [];
    const addedMissions: Mission[] = getMissionSuggestionsById(missionIds);

    if (addedMissions.length === 0) return;

    setActiveMissions((missions) => [
      ...addedMissions.filter((mission) => !missions.some((item) => item.id === mission.id)),
      ...missions,
    ]);
    window.history.replaceState(null, "", "/mission");
  }, []);

  function deleteMission(id: string) {
    setActiveMissions((missions) => missions.filter((mission) => mission.id !== id));
    setExpandedMissionId((expandedId) => (expandedId === id ? null : expandedId));
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-gray-0 pb-28 text-gray-900">
      <MissionHero />
      <section className="flex flex-col gap-5 px-5 pt-6">
        <MissionCategoryFilter activeCategory={activeCategory} onChange={setActiveCategory} />
        <MissionList
          expandedMissionId={expandedMissionId}
          completedMissions={visibleCompletedMissions}
          missions={visibleActiveMissions}
          onDelete={deleteMission}
          onToggle={(id) => setExpandedMissionId((expandedId) => (expandedId === id ? null : id))}
        />
      </section>
      <MissionAddMenu
        isOpen={isAddMenuOpen}
        onToggle={() => setIsAddMenuOpen((isOpen) => !isOpen)}
      />
    </main>
  );
}
