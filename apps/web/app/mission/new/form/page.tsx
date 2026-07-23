import { redirect } from "next/navigation";
import { MissionCreationIntro } from "@/app/mission/_components/mission-creation-intro";
import {
  buildMissionCreationFormHref,
  parseMissionCreationCategories,
} from "@/app/mission/constants/mission-creation";

interface MissionCreationFormPageProps {
  searchParams: Promise<{ categories?: string; step?: string }>;
}

export default async function MissionCreationFormPage({
  searchParams,
}: MissionCreationFormPageProps) {
  const { categories: categoriesParam, step: stepParam } = await searchParams;
  const categories = parseMissionCreationCategories(categoriesParam);
  const step = Number(stepParam);

  if (categories.length === 0 || !Number.isInteger(step) || step < 0 || step >= categories.length) {
    redirect("/mission/new");
  }

  const category = categories[step];
  if (!category) {
    redirect("/mission/new");
  }

  const previousHref =
    step === 0 ? "/mission/new" : buildMissionCreationFormHref(categories, step - 1);

  return <MissionCreationIntro category={category} previousHref={previousHref} />;
}
