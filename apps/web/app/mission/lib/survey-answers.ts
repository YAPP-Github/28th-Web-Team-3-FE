import type {
  MissionSurveyAnswerType,
  MissionSurveyFrequencyUnit,
  MissionSurveyNumericRule,
  MissionSurveyTextRule,
} from "@repo/schema/mission-survey";

/**
 * 설문 문항의 조건부 로직(스킵·배타 선택·숫자 규칙·유효성)을 서버가 내려준 메타데이터만으로
 * 계산하는 순수함수 모음. 카테고리별로 하드코딩하지 않고 `dependsOnQuestionCode`,
 * `skipWhenOptionCodes`, `exclusiveOptionCodes`, `numericRules`를 그대로 해석한다.
 */

/** 선행 질문 응답값이 스킵 대상 코드에 해당하면 현재 질문을 건너뛴다. */
export function isSkipped(
  skipWhenOptionCodes: readonly string[],
  dependencyValue: unknown,
): boolean {
  if (skipWhenOptionCodes.length === 0) return false;
  if (Array.isArray(dependencyValue)) {
    return dependencyValue.some((value) => skipWhenOptionCodes.includes(value));
  }
  return typeof dependencyValue === "string" && skipWhenOptionCodes.includes(dependencyValue);
}

/** 선행 질문에서 선택된 코드(subjectOptionCode)에 해당하는 숫자 규칙을 찾는다. */
export function findNumericRule(
  numericRules: readonly MissionSurveyNumericRule[],
  subjectOptionCode: string,
): MissionSurveyNumericRule | undefined {
  return numericRules.find((rule) => rule.subjectOptionCode === subjectOptionCode);
}

/** 숫자 규칙의 최솟값~최댓값을 개별 정수 선택지로 펼친다. */
export function numberRangeOptions(rule: MissionSurveyNumericRule): number[] {
  return Array.from(
    { length: rule.maximum - rule.minimum + 1 },
    (_, index) => rule.minimum + index,
  );
}

/**
 * 복수 선택 토글 — 배타 코드(exclusiveOptionCodes)를 선택하면 나머지를 모두 지우고,
 * 배타 코드가 선택된 상태에서 일반 코드를 고르면 배타 코드를 지운다.
 */
export function toggleMultiChoiceOption(
  current: readonly string[],
  code: string,
  exclusiveOptionCodes: readonly string[],
): string[] {
  if (current.includes(code)) return current.filter((value) => value !== code);
  if (exclusiveOptionCodes.includes(code)) return [code];
  return [...current.filter((value) => !exclusiveOptionCodes.includes(value)), code];
}

export function isSingleChoiceAnswered(value: unknown): boolean {
  return typeof value === "string" && value.length > 0;
}

export function isMultiChoiceAnswered(
  values: readonly string[],
  minSelections: number | null,
  maxSelections: number | null,
): boolean {
  const minimum = minSelections ?? 1;
  const maximum = maxSelections ?? Number.POSITIVE_INFINITY;
  return values.length >= minimum && values.length <= maximum;
}

export function isNumberAnswered(value: unknown): boolean {
  return typeof value === "number" && Number.isInteger(value);
}

/** textRules(예: HOBBY_TYPES의 OTHER)가 있는 옵션이 선택됐을 때 주관식 값 검증. */
export function isOtherTextValid(
  textRule: MissionSurveyTextRule | undefined,
  value: string | null | undefined,
): boolean {
  if (!textRule) return true;
  const trimmed = (value ?? "").trim();
  return trimmed.length >= textRule.minimumLength && trimmed.length <= textRule.maximumLength;
}

/** KEYED_NUMBER — 선행 다중 선택에서 고른 코드 전부에 개수가 채워져야 완료다. */
export function isKeyedNumberAnswered(
  entries: readonly { key: string; count: number }[],
  requiredKeys: readonly string[],
): boolean {
  if (requiredKeys.length === 0) return true;
  const answeredKeys = new Set(entries.map((entry) => entry.key));
  return (
    entries.length === requiredKeys.length &&
    entries.every((entry) => requiredKeys.includes(entry.key)) &&
    requiredKeys.every((key) => answeredKeys.has(key)) &&
    entries.every((entry) => Number.isInteger(entry.count))
  );
}

/** 숫자 선택지에 붙일 단위 접미사. */
export function frequencyUnitSuffix(unit: MissionSurveyFrequencyUnit): string {
  return unit === "SUBSCRIPTION_COUNT" ? "개" : unit === "DAYS_PER_WEEK" ? "일" : "회";
}

/** 문항을 건너뛸 때 필드에 채울 빈 값. */
export function emptyAnswerValue(answerType: MissionSurveyAnswerType): string[] | string | null {
  return answerType === "MULTI_CHOICE" || answerType === "KEYED_NUMBER" ? [] : null;
}

interface SkippableQuestion {
  code: string;
  dependsOnQuestionCode: string | null;
  skipWhenOptionCodes: readonly string[];
}

/**
 * 문항 목록에서 스킵 대상을 건너뛰며 다음(또는 이전) 노출 대상 인덱스를 찾는다.
 * 범위를 벗어나면(-1 또는 questions.length) 카테고리 경계를 넘었다는 뜻이다.
 */
export function walkToNextVisible(
  questions: readonly SkippableQuestion[],
  fromIndex: number,
  direction: 1 | -1,
  getAnswer: (questionCode: string) => unknown,
): { index: number; skippedCodes: string[] } {
  let cursor = fromIndex;
  const skippedCodes: string[] = [];
  for (;;) {
    const candidate = cursor + direction;
    if (candidate < 0 || candidate >= questions.length) return { index: candidate, skippedCodes };
    const candidateQuestion = questions[candidate];
    if (!candidateQuestion) return { index: candidate, skippedCodes };
    const dependencyValue = candidateQuestion.dependsOnQuestionCode
      ? getAnswer(candidateQuestion.dependsOnQuestionCode)
      : undefined;
    if (isSkipped(candidateQuestion.skipWhenOptionCodes, dependencyValue)) {
      skippedCodes.push(candidateQuestion.code);
      cursor = candidate;
      continue;
    }
    return { index: candidate, skippedCodes };
  }
}
