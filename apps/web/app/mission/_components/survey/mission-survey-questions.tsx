import type { MissionSurveyPutRequest, MissionSurveyQuestion } from "@repo/schema/mission-survey";
import { Button, ButtonGroup, Input, Progress } from "@repo/ui";
import { ChevronLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { type FieldPath, useFormContext, useWatch } from "react-hook-form";
import {
  MISSION_SURVEY_KEYED_NUMBER_KEY_FIELDS,
  MISSION_SURVEY_QUESTION_FIELDS,
  MISSION_SURVEY_TEXT_RULE_FIELDS,
} from "@/app/mission/constants/mission-survey";
import {
  emptyAnswerValue,
  findNumericRule,
  frequencyUnitSuffix,
  isFrequencyRangeAnswered,
  isKeyedFrequencyRangeAnswered,
  isKeyedNumberAnswered,
  isMultiChoiceAnswered,
  isNumberAnswered,
  isOtherTextValid,
  isSingleChoiceAnswered,
  numberRangeOptions,
  toggleMultiChoiceOption,
  walkToNextVisible,
} from "@/app/mission/lib/survey-answers";
import { KeyedFrequencyRangeQuestion, KeyedNumberQuestion } from "./keyed-number-question";
import { OptionPillList } from "./option-pill-list";

interface MissionSurveyQuestionsProps {
  /** 현재 카테고리의 문항 — 서버가 내려준 순서·조건 로직 그대로 렌더링한다. */
  questions: readonly MissionSurveyQuestion[];
  /** 첫 문항에서 "이전"을 누르면(카테고리 인트로로 복귀). */
  onExitToIntro: () => void;
  /** 마지막 문항에서 "다음"을 누르면(다음 카테고리 또는 제출). */
  onComplete: () => void;
  /** 마지막 카테고리 제출 실패 시 보여줄 메시지. */
  submitError?: string;
}

function toField(path: string) {
  return path as FieldPath<MissionSurveyPutRequest>;
}

function selectedCodes(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  return typeof value === "string" && value ? [value] : [];
}

function optionCodesFor(question: MissionSurveyQuestion, dependencyValue: unknown): Set<string> {
  const matchedRules = question.conditionalOptionRules.filter((rule) => {
    const dependencyCodes = selectedCodes(dependencyValue);
    return (
      rule.dependsOnQuestionCode === question.dependsOnQuestionCode &&
      dependencyCodes.some((code) => rule.whenOptionCodes.includes(code))
    );
  });

  if (matchedRules.length === 0) return new Set(question.options.map((option) => option.code));
  return new Set(matchedRules.flatMap((rule) => rule.allowedOptionCodes));
}

/** 설문 문항 스테퍼 — answerType·dependsOnQuestionCode 등 서버 메타데이터로 화면을 구성한다. */
export function MissionSurveyQuestions({
  questions,
  onExitToIntro,
  onComplete,
  submitError,
}: MissionSurveyQuestionsProps) {
  const { control, setValue, getValues } = useFormContext<MissionSurveyPutRequest>();
  const [index, setIndex] = useState(0);
  const question = questions[index];

  function fieldPathFor(code: string) {
    return toField(MISSION_SURVEY_QUESTION_FIELDS[code] ?? "");
  }

  function answerFor(code: string): unknown {
    return getValues(fieldPathFor(code));
  }

  function setField(path: FieldPath<MissionSurveyPutRequest>, fieldValue: unknown) {
    setValue(path, fieldValue as never, { shouldDirty: true });
  }

  function goTo(direction: 1 | -1) {
    const result = walkToNextVisible(questions, index, direction, answerFor);
    for (const code of result.skippedCodes) {
      const skippedQuestion = questions.find((item) => item.code === code);
      if (skippedQuestion) {
        setField(fieldPathFor(code), emptyAnswerValue(skippedQuestion.answerType));
      }
    }
    if (result.index < 0) {
      onExitToIntro();
      return;
    }
    if (result.index >= questions.length) {
      onComplete();
      return;
    }
    setIndex(result.index);
  }

  const fieldPath = question ? fieldPathFor(question.code) : toField("");
  // useWatch(하위 훅)는 조건 없이 매 렌더 호출해야 한다 — setValue만으로는 이 컴포넌트가
  // 다시 렌더되지 않아 pill이 "눌러도 안 눌린 것처럼" 보이는 문제가 생긴다.
  const value = useWatch({ control, name: fieldPath });
  const dependencyQuestion = question?.dependsOnQuestionCode
    ? questions.find((item) => item.code === question.dependsOnQuestionCode)
    : undefined;
  const dependencyValue = dependencyQuestion ? answerFor(dependencyQuestion.code) : undefined;
  const allowedOptionCodes = useMemo(
    () => (question ? optionCodesFor(question, dependencyValue) : new Set<string>()),
    [question, dependencyValue],
  );
  const visibleOptions =
    question?.options.filter((option) => allowedOptionCodes.has(option.code)) ?? [];

  const selectedMultiValues = selectedCodes(value).filter((code) => allowedOptionCodes.has(code));
  const textRule = question?.textRules.find((rule) =>
    selectedMultiValues.includes(rule.subjectOptionCode),
  );
  const textFieldPath = textRule
    ? toField(MISSION_SURVEY_TEXT_RULE_FIELDS[question?.code ?? ""] ?? "")
    : fieldPath;
  const watchedTextValue = useWatch({ control, name: textFieldPath });
  const textValue = textRule ? watchedTextValue : undefined;

  useEffect(() => {
    if (!question) return;

    if (question.answerType === "MULTI_CHOICE" && Array.isArray(value)) {
      const nextValue = selectedCodes(value).filter((code) => allowedOptionCodes.has(code));
      if (nextValue.length !== value.length) {
        setField(fieldPath, nextValue);
      }
      return;
    }

    if (
      (question.answerType === "KEYED_NUMBER" || question.answerType === "KEYED_FREQUENCY_RANGE") &&
      Array.isArray(value)
    ) {
      const keyField = MISSION_SURVEY_KEYED_NUMBER_KEY_FIELDS[question.code] ?? "key";
      const allowedKeys = new Set(selectedCodes(dependencyValue));
      const nextValue = (value as Record<string, unknown>[]).filter((entry) =>
        allowedKeys.has(String(entry[keyField])),
      );
      if (nextValue.length !== value.length) {
        setField(fieldPath, nextValue);
      }
    }
  }, [allowedOptionCodes, dependencyValue, fieldPath, question, value]);

  if (!question) return null;

  const answered = (() => {
    switch (question.answerType) {
      case "SINGLE_CHOICE":
        return isSingleChoiceAnswered(value);
      case "MULTI_CHOICE":
        return (
          isMultiChoiceAnswered(
            selectedMultiValues,
            question.minSelections,
            question.maxSelections,
          ) && isOtherTextValid(textRule, typeof textValue === "string" ? textValue : undefined)
        );
      case "NUMBER":
        return isNumberAnswered(value);
      case "FREQUENCY_RANGE":
        return isFrequencyRangeAnswered(value);
      case "KEYED_NUMBER": {
        const keyField = MISSION_SURVEY_KEYED_NUMBER_KEY_FIELDS[question.code] ?? "key";
        const entries = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
        const requiredKeys = Array.isArray(dependencyValue) ? (dependencyValue as string[]) : [];
        return isKeyedNumberAnswered(
          entries.map((entry) => ({
            key: String(entry[keyField]),
            count: typeof entry.count === "number" ? entry.count : Number.NaN,
          })),
          requiredKeys,
        );
      }
      case "KEYED_FREQUENCY_RANGE": {
        const keyField = MISSION_SURVEY_KEYED_NUMBER_KEY_FIELDS[question.code] ?? "key";
        const entries = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
        const requiredKeys = Array.isArray(dependencyValue) ? (dependencyValue as string[]) : [];
        return isKeyedFrequencyRangeAnswered(
          entries.map((entry) => ({
            key: String(entry[keyField]),
            frequencyRange: typeof entry.frequencyRange === "string" ? entry.frequencyRange : "",
          })),
          requiredKeys,
        );
      }
    }
  })();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-gray-0 pb-6">
      <Button
        aria-label="이전 단계로 돌아가기"
        size="icon"
        variant="ghost"
        onClick={() => goTo(-1)}
      >
        <ChevronLeft aria-hidden="true" className="size-6" />
      </Button>

      <div className="px-5 pt-2">
        <Progress aria-label="설문 진행률" value={((index + 1) / questions.length) * 100} />
      </div>

      <section className="flex flex-1 flex-col gap-8 px-5 pt-8">
        <h1 className="text-headline-h2-700 text-gray-900">{question.prompt}</h1>

        {question.answerType === "SINGLE_CHOICE" && (
          <OptionPillList
            options={visibleOptions}
            selectedCodes={typeof value === "string" && value ? [value] : []}
            onToggle={(code) => setField(fieldPath, code)}
          />
        )}

        {question.answerType === "MULTI_CHOICE" && (
          <div className="flex flex-col gap-4">
            <OptionPillList
              options={visibleOptions}
              selectedCodes={selectedMultiValues}
              onToggle={(code) =>
                setField(
                  fieldPath,
                  toggleMultiChoiceOption(selectedMultiValues, code, question.exclusiveOptionCodes),
                )
              }
            />
            {textRule && textFieldPath ? (
              <>
                {/* placeholder는 접근 가능한 이름이 아니다 — 입력하는 동안 사라져서
                    스크린리더가 읽을 게 없어진다. 라벨은 두되 화면에서만 숨긴다. */}
                <label className="sr-only" htmlFor="survey-other-text">
                  기타 직접 입력
                </label>
                <Input
                  id="survey-other-text"
                  maxLength={textRule.maximumLength}
                  placeholder="기타 취미를 입력해주세요"
                  type="text"
                  value={typeof textValue === "string" ? textValue : ""}
                  onChange={(event) => setField(textFieldPath, event.target.value)}
                />
              </>
            ) : null}
          </div>
        )}

        {question.answerType === "NUMBER" &&
          dependencyQuestion &&
          typeof dependencyValue === "string" &&
          (() => {
            const rule = findNumericRule(question.numericRules, dependencyValue);
            if (!rule) return null;
            const suffix = frequencyUnitSuffix(rule.unit);
            const selected = typeof value === "number" ? String(value) : undefined;
            return (
              <OptionPillList
                options={numberRangeOptions(rule).map((count) => ({
                  code: String(count),
                  label: `${count}${suffix}`,
                }))}
                selectedCodes={selected ? [selected] : []}
                onToggle={(code) => setField(fieldPath, Number(code))}
              />
            );
          })()}

        {question.answerType === "FREQUENCY_RANGE" && (
          <OptionPillList
            options={(question.frequencyRangeOptions ?? []).map((option) => ({
              code: option.code,
              label: option.label,
            }))}
            selectedCodes={typeof value === "string" && value ? [value] : []}
            onToggle={(code) => setField(fieldPath, code)}
          />
        )}

        {question.answerType === "KEYED_NUMBER" &&
          dependencyQuestion &&
          (() => {
            const keyField = MISSION_SURVEY_KEYED_NUMBER_KEY_FIELDS[question.code] ?? "key";
            const selectedKeyCodes = Array.isArray(dependencyValue)
              ? (dependencyValue as string[])
              : [];
            const keys = selectedKeyCodes.flatMap((code) => {
              const label = dependencyQuestion.options.find(
                (option) => option.code === code,
              )?.label;
              return label ? [{ code, label }] : [];
            });
            return (
              <KeyedNumberQuestion
                keyField={keyField}
                keys={keys}
                numericRules={question.numericRules}
                value={Array.isArray(value) ? (value as Record<string, unknown>[]) : []}
                onChange={(next) => setField(fieldPath, next)}
              />
            );
          })()}

        {question.answerType === "KEYED_FREQUENCY_RANGE" &&
          dependencyQuestion &&
          (() => {
            const keyField = MISSION_SURVEY_KEYED_NUMBER_KEY_FIELDS[question.code] ?? "key";
            const selectedKeyCodes = Array.isArray(dependencyValue)
              ? (dependencyValue as string[])
              : [];
            const keys = selectedKeyCodes.flatMap((code) => {
              const label = dependencyQuestion.options.find(
                (option) => option.code === code,
              )?.label;
              return label ? [{ code, label }] : [];
            });
            return (
              <KeyedFrequencyRangeQuestion
                frequencyRangeRules={question.frequencyRangeRules ?? []}
                keyField={keyField}
                keys={keys}
                value={Array.isArray(value) ? (value as Record<string, unknown>[]) : []}
                onChange={(next) => setField(fieldPath, next)}
              />
            );
          })()}
      </section>

      <div className="flex flex-col gap-2 px-5 pt-2">
        {submitError ? (
          <p className="text-center text-body-b2-500 text-red-500">{submitError}</p>
        ) : null}
        <ButtonGroup nextDisabled={!answered} onNext={() => goTo(1)} onPrev={() => goTo(-1)} />
      </div>
    </main>
  );
}
