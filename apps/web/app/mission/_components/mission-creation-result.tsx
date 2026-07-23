"use client";

import { ButtonGroup, Toggle } from "@repo/ui";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  buildMissionHomeHref,
  MISSION_SUGGESTIONS,
  type MissionCreationCategory,
  type MissionSuggestion,
} from "../constants/mission-creation";

interface MissionCreationResultProps {
  categories: readonly MissionCreationCategory[];
  previousHref: string;
}

interface MissionSuggestionCardProps extends MissionSuggestion {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
}

function MissionSuggestionCard({
  description,
  onPressedChange,
  pressed,
  title,
}: MissionSuggestionCardProps) {
  return (
    <Toggle
      aria-label={title}
      className="flex-col items-start gap-3 p-3"
      pressed={pressed}
      variant="onboarding"
      onPressedChange={onPressedChange}
    >
      <span className="text-body-b1-700 text-gray-900">{title}</span>
      <span className="flex items-start gap-2 text-left text-body-b2-400 text-gray-700">
        <span className="shrink-0 rounded bg-gray-50 px-1.5 py-1 text-caption-c1-700 text-gray-600">
          달성 시
        </span>
        <span>{description}</span>
      </span>
    </Toggle>
  );
}

export function MissionCreationResult({ categories, previousHref }: MissionCreationResultProps) {
  const router = useRouter();
  const [selectedMissionIds, setSelectedMissionIds] = useState<string[]>([]);

  function toggleMission(missionId: string, pressed: boolean) {
    setSelectedMissionIds((missionIds) =>
      pressed ? [...missionIds, missionId] : missionIds.filter((id) => id !== missionId),
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-gray-0 pb-6">
      <button
        aria-label="이전 단계로 돌아가기"
        className="flex size-11 items-center justify-center rounded-full p-2.5 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        type="button"
        onClick={() => router.push(previousHref)}
      >
        <ChevronLeft aria-hidden="true" className="size-6" />
      </button>

      <div className="flex flex-1 flex-col gap-8 px-5 pt-8">
        <h1 className="text-headline-h2-700 text-gray-900">
          미션을 생성했어요.
          <br />
          시작할 미션을 골라주세요.
        </h1>

        <div className="flex flex-col gap-8">
          {categories.map((category) => (
            <section key={category} className="flex flex-col gap-4">
              <h2 className="text-title-t2-700 text-gray-900">{category}</h2>
              <div className="flex flex-col gap-3">
                {MISSION_SUGGESTIONS[category].map((suggestion) => (
                  <MissionSuggestionCard
                    key={suggestion.id}
                    {...suggestion}
                    pressed={selectedMissionIds.includes(suggestion.id)}
                    onPressedChange={(pressed) => toggleMission(suggestion.id, pressed)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="px-5 pt-2">
        <ButtonGroup
          nextDisabled={selectedMissionIds.length === 0}
          onNext={() => router.push(buildMissionHomeHref(selectedMissionIds))}
          onPrev={() => router.push(previousHref)}
        />
      </div>
    </main>
  );
}
