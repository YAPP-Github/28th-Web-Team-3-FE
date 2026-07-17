import { describe, expect, it } from "vitest";
import { getQuestionStepIndex, QUESTION_STEPS } from "./question-steps";

describe("QUESTION_STEPS", () => {
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
});
