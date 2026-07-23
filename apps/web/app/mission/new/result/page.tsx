import { redirect } from "next/navigation";
import { MissionCreationResult } from "@/app/mission/_components/mission-creation-result";
import {
  buildMissionCreationFormHref,
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
    <MissionCreationResult
      categories={categories}
      previousHref={buildMissionCreationFormHref(categories, categories.length - 1)}
    />
  );
}
