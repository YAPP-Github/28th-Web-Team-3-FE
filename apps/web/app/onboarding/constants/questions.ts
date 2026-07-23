import type { OnboardingFormValues } from "@repo/schema";
import type { OnboardingQuestionStep } from "./question-steps";

type SingleChoiceFormFieldName = Extract<
  {
    [FieldName in keyof OnboardingFormValues]: "" extends OnboardingFormValues[FieldName]
      ? FieldName
      : never;
  }[keyof OnboardingFormValues],
  string
>;

type SingleChoiceFormFieldValue<TFieldName extends SingleChoiceFormFieldName> = Exclude<
  OnboardingFormValues[TFieldName],
  ""
>;

type SingleChoiceQuestionDefinition<
  TFieldName extends SingleChoiceFormFieldName = SingleChoiceFormFieldName,
> = {
  formFieldName: TFieldName;
  choices: readonly {
    label: string;
    value: SingleChoiceFormFieldValue<TFieldName>;
  }[];
  description: string;
  questionTitle: string;
};

export type SingleChoiceQuestionStep = Exclude<OnboardingQuestionStep, "age" | "month" | "net">;

export const AGE_GROUP_OPTIONS = [
  { label: "10대", value: "teens" },
  { label: "20대", value: "twenties" },
  { label: "30대", value: "thirties" },
  { label: "40대", value: "forties" },
  { label: "50대", value: "fifties" },
  { label: "60대 이상", value: "sixties-or-older" },
] as const;

export const SINGLE_CHOICE_QUESTION_DEFINITIONS = {
  period: {
    formFieldName: "investmentPeriod",
    choices: [
      { label: "6개월 정도 예상해요", value: "about-six-months" },
      { label: "1년 정도 예상해요", value: "about-one-year" },
      { label: "1년 6개월 정도 예상해요", value: "about-one-and-a-half-years" },
      { label: "2년 정도 예상해요", value: "about-two-years" },
      { label: "2년 6개월 정도 예상해요", value: "about-two-and-a-half-years" },
      { label: "3년 정도 예상해요", value: "about-three-years" },
    ],
    description: "투자 성향을 파악하기 위한 질문이에요.",
    questionTitle: "현재 투자자금의 예상 투자 기간은\n얼마나 되나요?",
  },
} satisfies Record<SingleChoiceQuestionStep, SingleChoiceQuestionDefinition>;
