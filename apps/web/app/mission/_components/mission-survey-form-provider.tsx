"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  type MissionSurveyPutRequest,
  missionSurveyPutRequestSchema,
} from "@repo/schema/mission-survey";
import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";

const EMPTY_SURVEY_VALUES: MissionSurveyPutRequest = {
  meal: null,
  transport: null,
  hobby: null,
  living: null,
};

/**
 * 미션 생성 설문 폼 상태 — 카테고리별 화면(intro→문항 1..N)이 각각 별도 라우트로
 * 이동해도 답변이 유지되도록 `/mission/new` 하위 전체를 감싸는 레이아웃에 마운트한다.
 * 온보딩 폼(OnboardingFormProvider)과 동일한 패턴이다.
 */
export function MissionSurveyFormProvider({ children }: { children: ReactNode }) {
  const formMethods = useForm<MissionSurveyPutRequest>({
    defaultValues: EMPTY_SURVEY_VALUES,
    resolver: zodResolver(missionSurveyPutRequestSchema),
  });

  return <FormProvider {...formMethods}>{children}</FormProvider>;
}
