import { redirect } from "next/navigation";
import { MissionCreationResult } from "@/app/mission/_components/mission-creation-result";

interface MissionCreationResultPageProps {
  searchParams: Promise<{ jobId?: string }>;
}

export default async function MissionCreationResultPage({
  searchParams,
}: MissionCreationResultPageProps) {
  const { jobId } = await searchParams;

  if (!jobId) {
    redirect("/mission/new");
  }

  return <MissionCreationResult jobId={jobId} />;
}
