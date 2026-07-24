import { describe, expect, it } from "vitest";
import {
  findNumericRule,
  frequencyUnitSuffix,
  isFrequencyRangeAnswered,
  isKeyedNumberAnswered,
  isMultiChoiceAnswered,
  isNumberAnswered,
  isOtherTextValid,
  isSingleChoiceAnswered,
  isSkipped,
  numberRangeOptions,
  toggleMultiChoiceOption,
  walkToNextVisible,
} from "./survey-answers";

describe("isSkipped", () => {
  it("스킵 대상 코드가 없으면 스킵하지 않는다", () => {
    expect(isSkipped([], "UNKNOWN")).toBe(false);
  });

  it("단일 선택 선행 응답이 스킵 코드와 일치하면 스킵한다", () => {
    expect(isSkipped(["UNKNOWN"], "UNKNOWN")).toBe(true);
    expect(isSkipped(["UNKNOWN"], "DELIVERY")).toBe(false);
  });

  it("복수 선택 선행 응답 중 하나라도 스킵 코드와 겹치면 스킵한다", () => {
    expect(isSkipped(["DO_NOT_REDUCE"], ["GOODS", "DO_NOT_REDUCE"])).toBe(true);
    expect(isSkipped(["DO_NOT_REDUCE"], ["GOODS"])).toBe(false);
  });
});

describe("findNumericRule / numberRangeOptions", () => {
  const paidBeverageRule = {
    subjectOptionCode: "PAID_BEVERAGE",
    unit: "TIMES_PER_WEEK" as const,
    minimum: 0,
    maximum: 14,
  };
  const deliveryRule = {
    subjectOptionCode: "DELIVERY",
    unit: "TIMES_PER_WEEK" as const,
    minimum: 0,
    maximum: 7,
  };
  const rules = [paidBeverageRule, deliveryRule];

  it("subjectOptionCode로 알맞은 규칙을 찾는다", () => {
    expect(findNumericRule(rules, "PAID_BEVERAGE")?.maximum).toBe(14);
    expect(findNumericRule(rules, "DELIVERY")?.maximum).toBe(7);
    expect(findNumericRule(rules, "UNKNOWN")).toBeUndefined();
  });

  it("최솟값~최댓값을 개별 정수로 펼친다", () => {
    expect(numberRangeOptions(deliveryRule)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });
});

describe("toggleMultiChoiceOption", () => {
  it("이미 선택된 코드는 해제한다", () => {
    expect(toggleMultiChoiceOption(["COOK"], "COOK", [])).toEqual([]);
  });

  it("배타 코드를 선택하면 기존 선택을 모두 지운다", () => {
    expect(
      toggleMultiChoiceOption(["COOK", "PICKUP"], "NO_ALTERNATIVE", ["NO_ALTERNATIVE"]),
    ).toEqual(["NO_ALTERNATIVE"]);
  });

  it("배타 코드가 선택된 상태에서 일반 코드를 고르면 배타 코드를 지운다", () => {
    expect(toggleMultiChoiceOption(["NO_ALTERNATIVE"], "COOK", ["NO_ALTERNATIVE"])).toEqual([
      "COOK",
    ]);
  });
});

describe("답변 완료 판정", () => {
  it("단일 선택은 값이 있어야 완료다", () => {
    expect(isSingleChoiceAnswered("DELIVERY")).toBe(true);
    expect(isSingleChoiceAnswered("")).toBe(false);
    expect(isSingleChoiceAnswered(undefined)).toBe(false);
  });

  it("복수 선택은 min~max 범위를 만족해야 완료다", () => {
    expect(isMultiChoiceAnswered(["COOK"], 1, 7)).toBe(true);
    expect(isMultiChoiceAnswered([], 1, 7)).toBe(false);
    expect(isMultiChoiceAnswered(["A", "B", "C"], 1, 2)).toBe(false);
  });

  it("숫자는 정수여야 완료다", () => {
    expect(isNumberAnswered(0)).toBe(true);
    expect(isNumberAnswered(3)).toBe(true);
    expect(isNumberAnswered(undefined)).toBe(false);
    expect(isNumberAnswered(1.5)).toBe(false);
  });

  it("빈도 범위는 범위 코드가 있어야 완료다", () => {
    expect(isFrequencyRangeAnswered("ONE_TO_TWO")).toBe(true);
    expect(isFrequencyRangeAnswered("")).toBe(false);
    expect(isFrequencyRangeAnswered(null)).toBe(false);
  });

  it("주관식은 textRule 길이 범위를 만족해야 유효하다", () => {
    const textRule = { subjectOptionCode: "OTHER", minimumLength: 1, maximumLength: 50 };
    expect(isOtherTextValid(textRule, "보드게임")).toBe(true);
    expect(isOtherTextValid(textRule, "  ")).toBe(false);
    expect(isOtherTextValid(textRule, "a".repeat(51))).toBe(false);
    expect(isOtherTextValid(undefined, null)).toBe(true);
  });

  it("KEYED_NUMBER는 선행 선택 코드 전부에 개수가 있어야 완료다", () => {
    expect(isKeyedNumberAnswered([{ key: "GOODS", count: 2 }], ["GOODS"])).toBe(true);
    expect(isKeyedNumberAnswered([{ key: "GOODS", count: 2 }], ["GOODS", "SUBSCRIPTION"])).toBe(
      false,
    );
    expect(isKeyedNumberAnswered([], [])).toBe(true);
  });
});

describe("frequencyUnitSuffix", () => {
  it("단위별 접미사를 반환한다", () => {
    expect(frequencyUnitSuffix("TIMES_PER_WEEK")).toBe("회");
    expect(frequencyUnitSuffix("TIMES_PER_FOUR_WEEKS")).toBe("회");
    expect(frequencyUnitSuffix("SUBSCRIPTION_COUNT")).toBe("개");
    expect(frequencyUnitSuffix("DAYS_PER_WEEK")).toBe("일");
  });
});

describe("walkToNextVisible", () => {
  // MEAL 순서를 흉내낸다: TARGET(0) -> FREQUENCY(1, depends on TARGET) -> ALTERNATIVES(2)
  // -> REASON(3, depends on TARGET) -> EXCLUSIONS(4)
  const questions = [
    { code: "MEAL_TARGET", dependsOnQuestionCode: null, skipWhenOptionCodes: [] },
    {
      code: "MEAL_FREQUENCY",
      dependsOnQuestionCode: "MEAL_TARGET",
      skipWhenOptionCodes: ["UNKNOWN"],
    },
    { code: "MEAL_ALTERNATIVES", dependsOnQuestionCode: null, skipWhenOptionCodes: [] },
    { code: "MEAL_REASON", dependsOnQuestionCode: "MEAL_TARGET", skipWhenOptionCodes: ["UNKNOWN"] },
    { code: "MEAL_EXCLUSIONS", dependsOnQuestionCode: null, skipWhenOptionCodes: [] },
  ];

  it("스킵 조건이 아니면 바로 다음 문항으로 이동한다", () => {
    const result = walkToNextVisible(questions, 0, 1, () => "DELIVERY");
    expect(result).toEqual({ index: 1, skippedCodes: [] });
  });

  it("스킵 조건이면 건너뛰고 다음 유효 문항까지 이동한다", () => {
    const result = walkToNextVisible(questions, 0, 1, () => "UNKNOWN");
    expect(result).toEqual({ index: 2, skippedCodes: ["MEAL_FREQUENCY"] });
  });

  it("뒤로 갈 때도 동일하게 스킵을 건너뛴다", () => {
    const result = walkToNextVisible(questions, 4, -1, () => "UNKNOWN");
    expect(result).toEqual({ index: 2, skippedCodes: ["MEAL_REASON"] });
  });

  it("범위를 벗어나면 경계 인덱스를 그대로 반환한다", () => {
    expect(walkToNextVisible(questions, 4, 1, () => "DELIVERY")).toEqual({
      index: 5,
      skippedCodes: [],
    });
    expect(walkToNextVisible(questions, 0, -1, () => "DELIVERY")).toEqual({
      index: -1,
      skippedCodes: [],
    });
  });
});
