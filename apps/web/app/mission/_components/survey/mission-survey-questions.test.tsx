import type { MissionSurveyPutRequest, MissionSurveyQuestion } from "@repo/schema/mission-survey";
import { fireEvent, render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { MissionSurveyQuestions } from "./mission-survey-questions";

const MEAL_EXCLUSIONS_QUESTION: MissionSurveyQuestion = {
  code: "MEAL_EXCLUSIONS",
  prompt: "식사 미션에서 제외해야 할 상황이 있나요?",
  answerType: "MULTI_CHOICE",
  options: [
    { code: "HEALTH_OR_DIET", label: "건강·식단상 필요한 식사" },
    { code: "NONE", label: "없음" },
  ],
  minSelections: 1,
  maxSelections: 6,
  dependsOnQuestionCode: null,
  skipWhenOptionCodes: [],
  numericRules: [],
  textRules: [],
  exclusiveOptionCodes: ["NONE"],
  conditionalOptionRules: [],
  impacts: [],
};

// 백엔드 MissionSurveyQuestionCatalog의 MEAL 문항 5개를 그대로 흉내낸다.
const MEAL_QUESTIONS: MissionSurveyQuestion[] = [
  {
    code: "MEAL_TARGET",
    prompt: "식사비 중 가장 소비가 큰 부분이 어디인가요?",
    answerType: "SINGLE_CHOICE",
    options: [
      { code: "DELIVERY", label: "배달 음식" },
      { code: "UNKNOWN", label: "아직 잘 모르겠어요" },
    ],
    minSelections: null,
    maxSelections: null,
    dependsOnQuestionCode: null,
    skipWhenOptionCodes: [],
    numericRules: [],
    textRules: [],
    exclusiveOptionCodes: [],
    conditionalOptionRules: [],
    impacts: [],
  },
  {
    code: "MEAL_FREQUENCY",
    prompt: "선택한 항목을 평소 한 주에 몇 번 이용하나요?",
    answerType: "FREQUENCY_RANGE",
    options: [],
    minSelections: null,
    maxSelections: null,
    dependsOnQuestionCode: "MEAL_TARGET",
    skipWhenOptionCodes: ["UNKNOWN"],
    numericRules: [],
    frequencyRangeOptions: [
      { code: "ONE_TO_TWO", label: "1~2회", minimum: 1, maximum: 2 },
      { code: "THREE_TO_FOUR", label: "3~4회", minimum: 3, maximum: 4 },
      { code: "FIVE_TO_SIX", label: "5~6회", minimum: 5, maximum: 6 },
      { code: "SEVEN_OR_MORE", label: "7회 이상", minimum: 7, maximum: null },
    ],
    textRules: [],
    exclusiveOptionCodes: [],
    conditionalOptionRules: [],
    impacts: [],
  },
  {
    code: "MEAL_ALTERNATIVES",
    prompt: "식사비를 줄일 때 사용할 수 있는 대안은 무엇인가요?",
    answerType: "MULTI_CHOICE",
    options: [
      { code: "COOK", label: "직접 요리" },
      { code: "NO_ALTERNATIVE", label: "가능한 대안이 없음" },
    ],
    minSelections: 1,
    maxSelections: 7,
    dependsOnQuestionCode: null,
    skipWhenOptionCodes: [],
    numericRules: [],
    textRules: [],
    exclusiveOptionCodes: ["NO_ALTERNATIVE"],
    conditionalOptionRules: [],
    impacts: [],
  },
  {
    code: "MEAL_REASON",
    prompt: "해당 소비가 발생하는 가장 큰 이유는 무엇인가요?",
    answerType: "SINGLE_CHOICE",
    options: [{ code: "HABIT", label: "습관" }],
    minSelections: null,
    maxSelections: null,
    dependsOnQuestionCode: "MEAL_TARGET",
    skipWhenOptionCodes: ["UNKNOWN"],
    numericRules: [],
    textRules: [],
    exclusiveOptionCodes: [],
    conditionalOptionRules: [],
    impacts: [],
  },
  MEAL_EXCLUSIONS_QUESTION,
];

function Wrapper({ children }: { children: React.ReactNode }) {
  const form = useForm<MissionSurveyPutRequest>({
    defaultValues: {
      meal: {
        target: "",
        weeklyFrequencyRange: null,
        alternatives: [],
        reason: null,
        exclusions: [],
      },
      transport: null,
      hobby: null,
      living: null,
    },
  });
  return <FormProvider {...form}>{children}</FormProvider>;
}

const HOBBY_QUESTIONS: MissionSurveyQuestion[] = [
  {
    code: "HOBBY_TYPES",
    prompt: "취미를 골라주세요",
    answerType: "MULTI_CHOICE",
    options: [
      { code: "GAME", label: "게임" },
      { code: "OTT", label: "OTT" },
    ],
    minSelections: 1,
    maxSelections: 2,
    dependsOnQuestionCode: null,
    skipWhenOptionCodes: [],
    numericRules: [],
    textRules: [],
    exclusiveOptionCodes: [],
    conditionalOptionRules: [],
    impacts: [],
  },
  {
    code: "HOBBY_SPENDING_TYPES",
    prompt: "지출 유형을 골라주세요",
    answerType: "MULTI_CHOICE",
    options: [
      { code: "GAME_ITEM", label: "게임 아이템" },
      { code: "SUBSCRIPTION", label: "구독" },
    ],
    minSelections: 1,
    maxSelections: 2,
    dependsOnQuestionCode: "HOBBY_TYPES",
    skipWhenOptionCodes: [],
    numericRules: [],
    textRules: [],
    exclusiveOptionCodes: [],
    conditionalOptionRules: [
      {
        dependsOnQuestionCode: "HOBBY_TYPES",
        whenOptionCodes: ["GAME"],
        allowedOptionCodes: ["GAME_ITEM"],
      },
      {
        dependsOnQuestionCode: "HOBBY_TYPES",
        whenOptionCodes: ["OTT"],
        allowedOptionCodes: ["SUBSCRIPTION"],
      },
    ],
    impacts: [],
  },
  {
    code: "HOBBY_FREQUENCIES",
    prompt: "몇 번 이용하나요?",
    answerType: "KEYED_FREQUENCY_RANGE",
    options: [],
    minSelections: null,
    maxSelections: null,
    dependsOnQuestionCode: "HOBBY_SPENDING_TYPES",
    skipWhenOptionCodes: [],
    numericRules: [],
    frequencyRangeRules: [
      {
        subjectOptionCode: "GAME_ITEM",
        unit: "TIMES_PER_FOUR_WEEKS",
        options: [
          { code: "ONE_TO_TWO", label: "1~2회", minimum: 1, maximum: 2 },
          { code: "THREE_TO_FOUR", label: "3~4회", minimum: 3, maximum: 4 },
        ],
      },
      {
        subjectOptionCode: "SUBSCRIPTION",
        unit: "SUBSCRIPTION_COUNT",
        options: [
          { code: "ONE", label: "1개", minimum: 1, maximum: 1 },
          { code: "TWO", label: "2개", minimum: 2, maximum: 2 },
        ],
      },
    ],
    textRules: [],
    exclusiveOptionCodes: [],
    conditionalOptionRules: [],
    impacts: [],
  },
];

function CaptureWrapper({
  children,
  onValues,
}: {
  children: (onComplete: () => void) => React.ReactNode;
  onValues: (values: MissionSurveyPutRequest) => void;
}) {
  const form = useForm<MissionSurveyPutRequest>({
    defaultValues: {
      meal: null,
      transport: null,
      hobby: {
        hobbies: [],
        otherHobby: null,
        spendingTypes: [],
        monthlySpendingRange: null,
        frequencies: [],
        savingMethods: [],
      },
      living: null,
    },
  });
  return <FormProvider {...form}>{children(() => onValues(form.getValues()))}</FormProvider>;
}

describe("MissionSurveyQuestions", () => {
  it("선택 전에는 다음 버튼이 비활성화된다", () => {
    render(
      <Wrapper>
        <MissionSurveyQuestions
          questions={MEAL_QUESTIONS}
          onComplete={vi.fn()}
          onExitToIntro={vi.fn()}
        />
      </Wrapper>,
    );

    expect(screen.getByText("식사비 중 가장 소비가 큰 부분이 어디인가요?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
  });

  it("선택하면 다음으로 넘어가고, 뒤로가면 답변이 유지된다", () => {
    render(
      <Wrapper>
        <MissionSurveyQuestions
          questions={MEAL_QUESTIONS}
          onComplete={vi.fn()}
          onExitToIntro={vi.fn()}
        />
      </Wrapper>,
    );

    fireEvent.click(screen.getByRole("button", { name: "배달 음식" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(screen.getByText("선택한 항목을 평소 한 주에 몇 번 이용하나요?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "이전" }));
    expect(screen.getByText("식사비 중 가장 소비가 큰 부분이 어디인가요?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "배달 음식" })).toHaveAttribute("data-state", "on");
  });

  it("UNKNOWN을 고르면 의존 문항(빈도·이유)을 건너뛴다", () => {
    render(
      <Wrapper>
        <MissionSurveyQuestions
          questions={MEAL_QUESTIONS}
          onComplete={vi.fn()}
          onExitToIntro={vi.fn()}
        />
      </Wrapper>,
    );

    fireEvent.click(screen.getByRole("button", { name: "아직 잘 모르겠어요" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(
      screen.getByText("식사비를 줄일 때 사용할 수 있는 대안은 무엇인가요?"),
    ).toBeInTheDocument();
  });

  it("마지막 문항에서 다음을 누르면 onComplete를 호출한다", () => {
    const onComplete = vi.fn();
    render(
      <Wrapper>
        <MissionSurveyQuestions
          questions={[MEAL_EXCLUSIONS_QUESTION]}
          onComplete={onComplete}
          onExitToIntro={vi.fn()}
        />
      </Wrapper>,
    );

    fireEvent.click(screen.getByRole("button", { name: "없음" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("첫 문항에서 이전을 누르면 onExitToIntro를 호출한다", () => {
    const onExitToIntro = vi.fn();
    render(
      <Wrapper>
        <MissionSurveyQuestions
          questions={MEAL_QUESTIONS}
          onComplete={vi.fn()}
          onExitToIntro={onExitToIntro}
        />
      </Wrapper>,
    );

    fireEvent.click(screen.getByRole("button", { name: "이전" }));
    expect(onExitToIntro).toHaveBeenCalledOnce();
  });

  it("기타 옵션을 고르면 라벨이 붙은 직접 입력 칸이 열린다", () => {
    const otherHobbyQuestion: MissionSurveyQuestion = {
      code: "HOBBY_TYPES",
      prompt: "취미를 골라주세요",
      answerType: "MULTI_CHOICE",
      options: [
        { code: "GAME", label: "게임" },
        { code: "OTHER", label: "기타" },
      ],
      minSelections: 1,
      maxSelections: 2,
      dependsOnQuestionCode: null,
      skipWhenOptionCodes: [],
      numericRules: [],
      textRules: [{ subjectOptionCode: "OTHER", minimumLength: 1, maximumLength: 20 }],
      exclusiveOptionCodes: [],
      conditionalOptionRules: [],
      impacts: [],
    };

    render(
      <CaptureWrapper onValues={vi.fn()}>
        {(onComplete) => (
          <MissionSurveyQuestions
            questions={[otherHobbyQuestion]}
            onComplete={onComplete}
            onExitToIntro={vi.fn()}
          />
        )}
      </CaptureWrapper>,
    );

    expect(screen.queryByLabelText("기타 직접 입력")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "기타" }));

    // placeholder가 아니라 라벨로 찾을 수 있어야 한다 — 입력 중에는 placeholder가 사라진다.
    expect(screen.getByLabelText("기타 직접 입력")).toBeInTheDocument();
  });

  it("조건부 선택지 규칙에 맞는 옵션만 보여준다", () => {
    render(
      <CaptureWrapper onValues={vi.fn()}>
        {(onComplete) => (
          <MissionSurveyQuestions
            questions={HOBBY_QUESTIONS}
            onComplete={onComplete}
            onExitToIntro={vi.fn()}
          />
        )}
      </CaptureWrapper>,
    );

    fireEvent.click(screen.getByRole("button", { name: "게임" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(screen.getByRole("button", { name: "게임 아이템" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "구독" })).not.toBeInTheDocument();
  });

  it("선행 다중 선택을 바꾸면 KEYED_FREQUENCY_RANGE의 이전 키 값을 제출에서 제거한다", () => {
    const onValues = vi.fn();
    render(
      <CaptureWrapper onValues={onValues}>
        {(onComplete) => (
          <MissionSurveyQuestions
            questions={HOBBY_QUESTIONS}
            onComplete={onComplete}
            onExitToIntro={vi.fn()}
          />
        )}
      </CaptureWrapper>,
    );

    fireEvent.click(screen.getByRole("button", { name: "게임" }));
    fireEvent.click(screen.getByRole("button", { name: "OTT" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.click(screen.getByRole("button", { name: "게임 아이템" }));
    fireEvent.click(screen.getByRole("button", { name: "구독" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    const [gameFrequencyButton] = screen.getAllByRole("button", { name: "1~2회" });
    if (!gameFrequencyButton) throw new Error("게임 아이템 빈도 선택지가 없습니다.");
    fireEvent.click(gameFrequencyButton);
    fireEvent.click(screen.getByRole("button", { name: "1개" }));
    fireEvent.click(screen.getByRole("button", { name: "이전" }));
    fireEvent.click(screen.getByRole("button", { name: "구독" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(onValues).toHaveBeenCalledWith(
      expect.objectContaining({
        hobby: expect.objectContaining({
          frequencies: [{ spendingType: "GAME_ITEM", frequencyRange: "ONE_TO_TWO" }],
        }),
      }),
    );
  });
});
