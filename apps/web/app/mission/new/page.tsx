"use client";

import { Button, Toggle } from "@repo/ui";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const RECOMMENDATION_CATEGORIES = [
  { description: "일주일에 2번, 집밥으로 점심 해결하기", name: "식비" },
  { description: "가까운 거리 1회 걸어가기", name: "교통" },
  { description: "이번 달 구독료 1개 해지", name: "취미" },
  { description: "무지출 데이 1회", name: "생활" },
] as const;

export default function NewMissionPage() {
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  function toggleCategory(category: string, pressed: boolean) {
    setSelectedCategories((categories) =>
      pressed ? [...categories, category] : categories.filter((item) => item !== category),
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-gray-0 pb-6">
      <button
        aria-label="미션 목록으로 돌아가기"
        className="p-[10px] flex w-fit h-fit items-center justify-center rounded-full hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        type="button"
        onClick={() => router.push("/mission")}
      >
        <ChevronLeft aria-hidden="true" className="size-6" />
      </button>
      <div className="flex px-5 flex-1 flex-col gap-12">
        <div className="flex flex-col gap-10">
          <section className="flex flex-col gap-1">
            <h1 className="text-headline-h2-700">
              어떤 카테고리에
              <br />
              도전할까요?
            </h1>
            <p className="text-body-b1-400 text-gray-700">중복 선택이 가능해요.</p>
          </section>

          <div className="flex flex-col gap-3">
            {RECOMMENDATION_CATEGORIES.map((category) => (
              <Toggle
                key={category.name}
                aria-label={category.name}
                pressed={selectedCategories.includes(category.name)}
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
        <Button disabled={selectedCategories.length === 0} size="cta">
          다음
        </Button>
      </div>
    </main>
  );
}
