"use client";

import type { MissionDraft } from "@repo/schema/mission-generation";
import { Button, ButtonGroup, Toggle } from "@repo/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MissionListSkeleton } from "@/app/_components/mission-list-skeleton";
import { MISSION_CATEGORY_LABELS } from "@/app/(tabs)/mission/constants/mission";
import { stopMissionGenerationWorkerPolling } from "@/app/mission/new/utils/mission-generation-polling";
import { clearPendingMissionGeneration } from "@/app/mission/new/utils/pending-mission-generation";
import {
  confirmGenerationJobOptions,
  generationDraftsOptions,
} from "@/lib/queries/mission-generation";

interface MissionCreationResultProps {
  jobId: string;
}

interface MissionDraftCardProps extends MissionDraft {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
}

function MissionDraftCard({
  title,
  savingsLabel,
  pressed,
  onPressedChange,
}: MissionDraftCardProps) {
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
        <span>{savingsLabel}</span>
      </span>
    </Toggle>
  );
}

export function MissionCreationResult({ jobId }: MissionCreationResultProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isPending, isError } = useQuery(generationDraftsOptions(jobId));
  const confirmJob = useMutation(confirmGenerationJobOptions(jobId, queryClient));
  const [selectedDraftIds, setSelectedDraftIds] = useState<string[]>([]);

  useEffect(() => {
    void clearPendingMissionGeneration();
    stopMissionGenerationWorkerPolling(jobId);
  }, [jobId]);

  function toggleDraft(id: string, pressed: boolean) {
    setSelectedDraftIds((ids) => {
      if (!pressed) return ids.filter((item) => item !== id);
      if (ids.includes(id)) return ids;
      return [...ids, id];
    });
  }

  if (isPending) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-gray-0 pb-6">
        <MissionListSkeleton className="px-5 pt-20" count={3} label="미션 초안을 불러오는 중" />
      </main>
    );
  }

  // 재조회 실패로는 화면을 내리지 않는다 — react-query가 이전 데이터를 유지한 채 isError를 켠다.
  if (isError && !data) {
    return (
      <p className="px-5 pt-20 text-center text-body-b2-500 text-gray-500">
        미션 초안을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
      </p>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-gray-0 pb-6">
      <Button
        aria-label="미션 홈으로"
        size="icon"
        variant="ghost"
        onClick={() => router.push("/mission")}
      >
        <ChevronLeft aria-hidden="true" className="size-6" />
      </Button>

      <div className="flex flex-1 flex-col gap-8 px-5 pt-8">
        <h1 className="text-headline-h2-700 text-gray-900">
          미션을 생성했어요.
          <br />
          시작할 미션을 골라주세요.
        </h1>

        <div className="flex flex-col gap-8">
          {data.categories.map(({ category, drafts }) => (
            <section key={category} className="flex flex-col gap-4">
              <h2 className="text-title-t2-700 text-gray-900">
                {MISSION_CATEGORY_LABELS[category]}
              </h2>
              <div className="flex flex-col gap-3">
                {drafts.map((draft) => (
                  <MissionDraftCard
                    key={draft.id}
                    {...draft}
                    pressed={selectedDraftIds.includes(draft.id)}
                    onPressedChange={(pressed) => toggleDraft(draft.id, pressed)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="px-5 pt-2">
        {confirmJob.isError ? (
          <p className="pb-2 text-center text-body-b2-500 text-red-500">
            미션 시작에 실패했어요. 다시 시도해 주세요.
          </p>
        ) : null}
        <ButtonGroup
          nextDisabled={selectedDraftIds.length === 0}
          nextPending={confirmJob.isPending}
          onNext={() =>
            confirmJob.mutate({ selectedDraftIds }, { onSuccess: () => router.push("/mission") })
          }
          onPrev={() => router.push("/mission")}
        />
      </div>
    </main>
  );
}
