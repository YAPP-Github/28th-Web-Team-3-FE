"use client";

import { useState } from "react";
import { MissionAddMenu } from "./_components/mission-add-menu";
import { MissionCategoryFilter } from "./_components/mission-category-filter";
import { MissionHero } from "./_components/mission-hero";
import { MissionList } from "./_components/mission-list";
import { ACTIVE_MISSIONS, type MissionCategory } from "./constants/mission";

export default function MissionPage() {
  const [activeCategory, setActiveCategory] = useState<MissionCategory>("전체");
  const [expandedMissionTitle, setExpandedMissionTitle] = useState<string | null>(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const visibleMissions = ACTIVE_MISSIONS.filter(
    (mission) => activeCategory === "전체" || mission.category === activeCategory,
  );

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-gray-0 pb-28 text-gray-900">
      <MissionHero />
      <section className="flex flex-col gap-5 px-5 pt-6">
        <MissionCategoryFilter activeCategory={activeCategory} onChange={setActiveCategory} />
        <MissionList
          expandedMissionTitle={expandedMissionTitle}
          missions={visibleMissions}
          onToggle={(title) =>
            setExpandedMissionTitle((expandedTitle) => (expandedTitle === title ? null : title))
          }
        />
      </section>
      <MissionAddMenu
        isOpen={isAddMenuOpen}
        onToggle={() => setIsAddMenuOpen((isOpen) => !isOpen)}
      />
    </main>
  );
}
