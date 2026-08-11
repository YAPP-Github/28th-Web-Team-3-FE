import { redirect } from "next/navigation";
import { MissionCreationFormClient } from "@/app/mission/_components/mission-creation-form-client";
import {
  MISSION_CREATION_CATEGORY_CODES,
  parseMissionCreationCategory,
} from "@/app/mission/constants/mission-creation";

interface MissionCreationFormPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function MissionCreationFormPage({
  searchParams,
}: MissionCreationFormPageProps) {
  const { category: categoryParam } = await searchParams;
  const category = parseMissionCreationCategory(categoryParam);
  if (!category) {
    redirect("/mission/new");
  }

  return (
    <MissionCreationFormClient
      category={category}
      categoryCode={MISSION_CREATION_CATEGORY_CODES[category]}
      previousHref="/mission/new"
    />
  );
}
