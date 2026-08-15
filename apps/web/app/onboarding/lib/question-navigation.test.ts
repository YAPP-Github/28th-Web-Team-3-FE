import { describe, expect, it } from "vitest";
import { ONBOARDING_QUESTION_STEPS } from "@/app/onboarding/constants/question-steps";
import {
  getNextOnboardingQuestionPath,
  getOnboardingQuestionStepIndex,
  getPreviousOnboardingQuestionPath,
} from "./question-navigation";

describe("onboarding question navigation", () => {
  it("온보딩 질문 순서를 유지한다", () => {
    expect(ONBOARDING_QUESTION_STEPS).toEqual(["age", "address", "month", "net", "period"]);
  });

  it("경로에 해당하는 질문 인덱스를 반환한다", () => {
    expect(getOnboardingQuestionStepIndex("/onboarding/age")).toBe(0);
    expect(getOnboardingQuestionStepIndex("/onboarding/period")).toBe(4);
    expect(getOnboardingQuestionStepIndex("/onboarding/intro")).toBe(-1);
  });

  it("질문의 이전과 다음 경로를 반환한다", () => {
    expect(getPreviousOnboardingQuestionPath("age")).toBe("/onboarding/intro");
    expect(getPreviousOnboardingQuestionPath("month")).toBe("/onboarding/address");
    expect(getPreviousOnboardingQuestionPath("period")).toBe("/onboarding/net");
    expect(getNextOnboardingQuestionPath("age")).toBe("/onboarding/address");
    expect(getNextOnboardingQuestionPath("period")).toBe("/onboarding/check");
  });
});
