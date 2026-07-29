"use client";

import type { MissionCategory } from "@repo/schema/mission";
import type { MissionSurveyPutRequest } from "@repo/schema/mission-survey";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import type { MissionCreationCategory } from "@/app/mission/constants/mission-creation";
import { buildMissionGeneratingHref } from "@/app/mission/constants/mission-creation";
import { requestGenerationJobOptions } from "@/lib/queries/mission-generation";
import { replaceSurveyOptions, surveyQuestionsOptions } from "@/lib/queries/mission-survey";
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
  const { data } = useQuery(surveyQuestionsOptions([categoryCode]));
  const replaceSurvey = useMutation(replaceSurveyOptions());
  const requestJob = useMutation(requestGenerationJobOptions());
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

  // 두 단계를 구분해 알린다 — 설문 저장이 끝난 뒤 생성 요청만 실패했다면 답변은
  // 이미 서버에 있으므로, 뭉뚱그리면 사용자가 설문을 처음부터 다시 채운다.
  return (
    <MissionSurveyQuestions
      questions={questions}
      submitError={
        replaceSurvey.isError
          ? "설문을 저장하지 못했어요. 잠시 후 다시 시도해 주세요."
          : requestJob.isError
            ? "미션 생성을 시작하지 못했어요. 잠시 후 다시 시도해 주세요."
            : undefined
      }
      onComplete={proceed}
      onExitToIntro={() => setPhase("intro")}
    />
  );
}
