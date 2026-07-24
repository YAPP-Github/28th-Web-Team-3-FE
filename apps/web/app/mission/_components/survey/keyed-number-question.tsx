"use client";

import type { MissionSurveyFrequencyRangeRule } from "@repo/schema/mission-survey";
import { findNumericRule, frequencyUnitSuffix, numberRangeOptions } from "../../lib/survey-answers";
import { OptionPillList } from "./option-pill-list";

interface KeyedNumberQuestionProps {
  numericRules: Parameters<typeof findNumericRule>[0];
  /** 선행 다중 선택에서 고른 코드들과 라벨(그 문항의 options에서 가져온다). */
  keys: readonly { code: string; label: string }[];
  keyField: string;
  value: readonly Record<string, unknown>[];
  onChange: (value: Record<string, unknown>[]) => void;
}

/** KEYED_NUMBER — 선행 선택 코드별로 독립된 숫자 pill 목록을 반복한다(Figma에 없는 타입, NUMBER 패턴을 확장). */
export function KeyedNumberQuestion({
  numericRules,
  keys,
  keyField,
  value,
  onChange,
}: KeyedNumberQuestionProps) {
  return (
    <div className="flex flex-col gap-6">
      {keys.map((key) => {
        const rule = findNumericRule(numericRules, key.code);
        if (!rule) return null;
        const suffix = frequencyUnitSuffix(rule.unit);
        const current = value.find((entry) => entry[keyField] === key.code);
        const selectedCode = typeof current?.count === "number" ? String(current.count) : undefined;

        return (
          <div key={key.code} className="flex flex-col gap-3">
            <p className="text-body-b1-700 text-gray-900">{key.label}</p>
            <OptionPillList
              options={numberRangeOptions(rule).map((count) => ({
                code: String(count),
                label: `${count}${suffix}`,
              }))}
              selectedCodes={selectedCode ? [selectedCode] : []}
              onToggle={(code) => {
                const rest = value.filter((entry) => entry[keyField] !== key.code);
                onChange([...rest, { [keyField]: key.code, count: Number(code) }]);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

interface KeyedFrequencyRangeQuestionProps {
  frequencyRangeRules: readonly MissionSurveyFrequencyRangeRule[];
  /** 선행 다중 선택에서 고른 코드들과 라벨(그 문항의 options에서 가져온다). */
  keys: readonly { code: string; label: string }[];
  keyField: string;
  value: readonly Record<string, unknown>[];
  onChange: (value: Record<string, unknown>[]) => void;
}

/** KEYED_FREQUENCY_RANGE — 선행 선택 코드별로 서버가 내려준 범위 pill 목록을 반복한다. */
export function KeyedFrequencyRangeQuestion({
  frequencyRangeRules,
  keys,
  keyField,
  value,
  onChange,
}: KeyedFrequencyRangeQuestionProps) {
  return (
    <div className="flex flex-col gap-6">
      {keys.map((key) => {
        const rule = frequencyRangeRules.find((item) => item.subjectOptionCode === key.code);
        if (!rule) return null;
        const current = value.find((entry) => entry[keyField] === key.code);
        const selectedCode =
          typeof current?.frequencyRange === "string" ? current.frequencyRange : undefined;

        return (
          <div key={key.code} className="flex flex-col gap-3">
            <p className="text-body-b1-700 text-gray-900">{key.label}</p>
            <OptionPillList
              options={rule.options.map((option) => ({
                code: option.code,
                label: option.label,
              }))}
              selectedCodes={selectedCode ? [selectedCode] : []}
              onToggle={(code) => {
                const rest = value.filter((entry) => entry[keyField] !== key.code);
                onChange([...rest, { [keyField]: key.code, frequencyRange: code }]);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
