"use client";

import type { MissionDraft } from "@repo/schema/mission-generation";
import { ButtonGroup, Toggle } from "@repo/ui";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MISSION_CATEGORY_LABELS } from "@/app/(tabs)/mission/constants/mission";
import { useConfirmGenerationJob, useGenerationDrafts } from "@/app/mission/_generation/queries";

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
  const { data, isPending, isError } = useGenerationDrafts(jobId);
  const confirmJob = useConfirmGenerationJob(jobId);
  const [selectedDraftIds, setSelectedDraftIds] = useState<string[]>([]);

  function toggleDraft(id: string, pressed: boolean) {
    setSelectedDraftIds((ids) => {
      if (!pressed) return ids.filter((item) => item !== id);
      if (ids.includes(id)) return ids;
      return [...ids, id];
    });
  }

  if (isPending) {
    return <p className="px-5 pt-20 text-center text-body-b2-500 text-gray-400">불러오는 중…</p>;
  }

  if (isError) {
    return (
      <p className="px-5 pt-20 text-center text-body-b2-500 text-gray-500">
        미션 초안을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
      </p>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-gray-0 pb-6">
      <button
        aria-label="미션 홈으로"
        className="flex size-11 items-center justify-center rounded-full p-2.5 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        type="button"
        onClick={() => router.push("/mission")}
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
          onNext={() =>
            confirmJob.mutate({ selectedDraftIds }, { onSuccess: () => router.push("/mission") })
          }
          onPrev={() => router.push("/mission")}
        />
      </div>
    </main>
  );
}
