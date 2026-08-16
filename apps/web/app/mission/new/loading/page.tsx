import { redirect } from "next/navigation";
import { MissionLoading } from "@/app/mission/_components/mission-loading";

interface MissionLoadingPageProps {
  searchParams: Promise<{ jobId?: string }>;
}

/** 설문 제출 단계에서 만든 생성 job의 jobId를 URL로 받아 완료될 때까지 polling한다. */
export default async function MissionLoadingPage({ searchParams }: MissionLoadingPageProps) {
  const { jobId } = await searchParams;

  if (!jobId) {
    redirect("/mission/new");
  }

  return <MissionLoading jobId={jobId} />;
}
