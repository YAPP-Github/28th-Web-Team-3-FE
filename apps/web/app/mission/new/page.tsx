"use client";

import { Button, Toggle } from "@repo/ui";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  buildMissionCreationFormHref,
  MISSION_RECOMMENDATION_CATEGORIES,
  type MissionCreationCategory,
} from "@/app/mission/constants/mission-creation";

export default function NewMissionPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<MissionCreationCategory>();

  function toggleCategory(category: MissionCreationCategory, pressed: boolean) {
    setSelectedCategory(pressed ? category : undefined);
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-gray-0 pb-6">
      <div className="flex flex-1 flex-col gap-8">
        <Button
          aria-label="미션 목록으로 돌아가기"
          size="icon"
          variant="ghost"
          onClick={() => router.push("/mission")}
        >
          <ChevronLeft aria-hidden="true" className="size-6" />
        </Button>
        <div className="flex flex-1 flex-col gap-8 px-5">
          <section className="flex flex-col gap-1">
            <h1 className="text-headline-h2-700">
              어떤 카테고리에
              <br />
              도전할까요?
            </h1>
            <p className="text-body-b1-400 text-gray-700">한 가지를 선택해 주세요.</p>
          </section>

          <div className="flex flex-col gap-3">
            {MISSION_RECOMMENDATION_CATEGORIES.map((category) => (
              <Toggle
                key={category.name}
                aria-label={category.name}
                pressed={selectedCategory === category.name}
                className="group"
                variant="onboarding"
                onPressedChange={(pressed) => toggleCategory(category.name, pressed)}
              >
                <span className="flex flex-col items-start gap-2">
                  <span className="text-body-b1-700">{category.name}</span>
                  <span className="flex items-center gap-1 text-body-b2-500 text-gray-600">
                    <span className="rounded bg-gray-100 px-1.5 py-1 text-caption-c1-700 text-gray-600 group-data-[state=on]:bg-blue-200 group-data-[state=on]:text-blue-700">
                      예시
                    </span>
                    {category.description}
                  </span>
                </span>
              </Toggle>
            ))}
          </div>
        </div>
      </div>
      <div className="px-5">
        <Button
          disabled={!selectedCategory}
          size="cta"
          onClick={() => {
            if (selectedCategory) router.push(buildMissionCreationFormHref(selectedCategory));
          }}
        >
          다음
        </Button>
      </div>
    </main>
  );
}
