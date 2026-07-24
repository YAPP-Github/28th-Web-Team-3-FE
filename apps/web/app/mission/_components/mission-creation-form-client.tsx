"use client";

import type { MissionCategory } from "@repo/schema/mission";
import type { MissionSurveyPutRequest } from "@repo/schema/mission-survey";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import type { MissionCreationCategory } from "@/app/mission/constants/mission-creation";
import { buildMissionGeneratingHref } from "@/app/mission/constants/mission-creation";
import { useRequestGenerationJob } from "@/app/mission/generation-queries";
import { useReplaceSurvey, useSurveyQuestions } from "@/app/mission/survey-queries";
import { MissionCreationIntro } from "./mission-creation-intro";
import { MissionSurveyQuestions } from "./survey/mission-survey-questions";

interface MissionCreationFormClientProps {
  category: MissionCreationCategory;
  categoryCode: MissionCategory;
  isLastCategory: boolean;
  nextHref: string;
  previousHref: string;
}

/**
 * 카테고리 하나의 인트로→설문 문항 화면. 답변은 레이아웃에 마운트된
 * MissionSurveyFormProvider가 카테고리 스텝을 넘나들어도 유지한다.
 */
export function MissionCreationFormClient({
  category,
  categoryCode,
  isLastCategory,
  nextHref,
  previousHref,
}: MissionCreationFormClientProps) {
  const router = useRouter();
  const { data } = useSurveyQuestions([categoryCode]);
  const replaceSurvey = useReplaceSurvey();
  const requestJob = useRequestGenerationJob();
  const { getValues } = useFormContext<MissionSurveyPutRequest>();
  const [phase, setPhase] = useState<"intro" | "questions">("intro");
  const questions = data?.categories[0]?.questions ?? [];

  // 마지막 카테고리에서: 설문 저장 → 생성 job 요청 → jobId를 URL로 넘겨 생성 화면으로 이동한다.
  // job 요청을 생성 화면 mount 이펙트가 아니라 여기(클릭 핸들러)에서 하는 이유 —
  // 이펙트에서 쏜 mutation은 StrictMode 이중 마운트에서 observer가 갈려 결과가 유실된다.
  function proceed() {
    if (!isLastCategory) {
      router.push(nextHref);
      return;
    }
    replaceSurvey.mutate(getValues(), {
      onSuccess: () =>
        requestJob.mutate(undefined, {
          onSuccess: (job) => router.push(buildMissionGeneratingHref(job.jobId)),
        }),
    });
  }

  if (phase === "intro") {
    return (
      <MissionCreationIntro
        category={category}
        previousHref={previousHref}
        onNext={() => {
          if (!data) return;
          setPhase("questions");
        }}
      />
    );
  }

  return (
    <MissionSurveyQuestions
      questions={questions}
      submitError={
        replaceSurvey.isError || requestJob.isError
          ? "제출에 실패했어요. 다시 시도해 주세요."
          : undefined
      }
      onComplete={proceed}
      onExitToIntro={() => setPhase("intro")}
    />
  );
}
