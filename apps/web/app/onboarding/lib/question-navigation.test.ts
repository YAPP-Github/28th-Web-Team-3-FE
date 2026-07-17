import { describe, expect, it } from "vitest";
import { QUESTION_STEPS } from "../constants/question-steps";
import {
  getNextQuestionPath,
  getPreviousQuestionPath,
  getQuestionStepIndex,
} from "./question-navigation";

describe("onboarding question navigation", () => {
  it("온보딩 질문 순서를 유지한다", () => {
    expect(QUESTION_STEPS).toEqual([
      "age",
      "month",
      "net",
      "finance",
      "experience",
      "risk",
      "loss",
      "period",
      "interest",
    ]);
  });

  it("경로에 해당하는 질문 인덱스를 반환한다", () => {
    expect(getQuestionStepIndex("/onboarding/age")).toBe(0);
    expect(getQuestionStepIndex("/onboarding/interest")).toBe(8);
    expect(getQuestionStepIndex("/onboarding/intro")).toBe(-1);
  });

  it("질문의 이전과 다음 경로를 반환한다", () => {
    expect(getPreviousQuestionPath("age")).toBe("/onboarding/intro");
    expect(getPreviousQuestionPath("finance")).toBe("/onboarding/net");
    expect(getNextQuestionPath("finance")).toBe("/onboarding/experience");
    expect(getNextQuestionPath("interest")).toBe("/onboarding/result");
  });
});
