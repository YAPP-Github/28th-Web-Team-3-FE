import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MissionSuggestionCard } from "@/app/mission/_components/mission-suggestion-card";
import {
  buildMissionCreationFormHref,
  MISSION_SUGGESTIONS,
  parseMissionCreationCategories,
} from "@/app/mission/constants/mission-creation";

interface MissionCreationResultPageProps {
  searchParams: Promise<{ categories?: string }>;
}

export default async function MissionCreationResultPage({
  searchParams,
}: MissionCreationResultPageProps) {
  const { categories: categoriesParam } = await searchParams;
  const categories = parseMissionCreationCategories(categoriesParam);

  if (categories.length === 0) {
    redirect("/mission/new");
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-gray-0 pb-6">
      <Link
        aria-label="이전 단계로 돌아가기"
        className="flex size-11 items-center justify-center rounded-full p-2.5 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        href={buildMissionCreationFormHref(categories, categories.length - 1)}
      >
        <ChevronLeft aria-hidden="true" className="size-6" />
      </Link>

      <div className="flex flex-col gap-14 px-5 pt-8">
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
                {MISSION_SUGGESTIONS[category].map((suggestion, index) => (
                  <MissionSuggestionCard key={`${suggestion.title}-${index}`} {...suggestion} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
