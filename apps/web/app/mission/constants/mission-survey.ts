import type {
  HobbySurveyAnswers,
  LivingSurveyAnswers,
  MealSurveyAnswers,
  MissionSurveyPutRequest,
  TransportSurveyAnswers,
} from "@repo/schema/mission-survey";

/**
 * 설문 문항 코드 → 답변을 저장할 요청 필드 경로.
 * 문항 자체(라벨·선택지·조건 로직)는 서버가 내려주는 메타데이터로 렌더링하지만,
 * 최종 PUT 페이로드의 필드명은 서버 계약(예: MEAL_TARGET → meal.target)에 맞춰 고정 매핑해야 한다.
 */
export const MISSION_SURVEY_QUESTION_FIELDS: Record<string, string> = {
  MEAL_TARGET: "meal.target",
  MEAL_FREQUENCY: "meal.weeklyFrequencyRange",
  MEAL_ALTERNATIVES: "meal.alternatives",
  MEAL_REASON: "meal.reason",
  MEAL_EXCLUSIONS: "meal.exclusions",
  TRANSPORT_PRIMARY_MODE: "transport.primaryMode",
  TRANSPORT_TARGET: "transport.target",
  TRANSPORT_FREQUENCY: "transport.weeklyFrequencyRange",
  TRANSPORT_REASON: "transport.reason",
  TRANSPORT_EXCLUSIONS: "transport.exclusions",
  HOBBY_TYPES: "hobby.hobbies",
  HOBBY_SPENDING_TYPES: "hobby.spendingTypes",
  HOBBY_MONTHLY_SPENDING: "hobby.monthlySpendingRange",
  HOBBY_FREQUENCIES: "hobby.frequencies",
  HOBBY_SAVING_METHODS: "hobby.savingMethods",
  LIVING_AREAS: "living.areas",
  LIVING_MONTHLY_SPENDING: "living.monthlySpendingRange",
  LIVING_FREQUENCIES: "living.frequencies",
  LIVING_TRIGGER: "living.trigger",
  LIVING_SAVING_METHODS: "living.savingMethods",
};

/** textRules가 있는 옵션을 선택했을 때 주관식을 적을 필드(문항 코드 기준, 현재는 HOBBY_TYPES뿐). */
export const MISSION_SURVEY_TEXT_RULE_FIELDS: Record<string, string> = {
  HOBBY_TYPES: "hobby.otherHobby",
};

/** KEYED_NUMBER 응답 배열에서 항목을 구분하는 key 필드명(예: {spendingType, count} vs {area, count}). */
export const MISSION_SURVEY_KEYED_NUMBER_KEY_FIELDS: Record<string, string> = {
  HOBBY_FREQUENCIES: "spendingType",
  LIVING_FREQUENCIES: "area",
};

export const DEFAULT_MEAL_ANSWERS: MealSurveyAnswers = {
  target: "",
  weeklyFrequencyRange: null,
  alternatives: [],
  reason: null,
  exclusions: [],
};

export const DEFAULT_TRANSPORT_ANSWERS: TransportSurveyAnswers = {
  primaryMode: "",
  target: "",
  weeklyFrequencyRange: null,
  reason: "",
  exclusions: [],
};

export const DEFAULT_HOBBY_ANSWERS: HobbySurveyAnswers = {
  hobbies: [],
  otherHobby: null,
  spendingTypes: [],
  monthlySpendingRange: null,
  frequencies: [],
  savingMethods: [],
};

export const DEFAULT_LIVING_ANSWERS: LivingSurveyAnswers = {
  areas: [],
  monthlySpendingRange: null,
  frequencies: [],
  trigger: "",
  savingMethods: [],
};

/** 선택된 카테고리만 기본값을 채운 폼 초기값을 만든다. */
export function buildDefaultSurveyValues(
  categories: readonly ("MEAL" | "TRANSPORT" | "HOBBY" | "LIVING")[],
): MissionSurveyPutRequest {
  return {
    meal: categories.includes("MEAL") ? DEFAULT_MEAL_ANSWERS : null,
    transport: categories.includes("TRANSPORT") ? DEFAULT_TRANSPORT_ANSWERS : null,
    hobby: categories.includes("HOBBY") ? DEFAULT_HOBBY_ANSWERS : null,
    living: categories.includes("LIVING") ? DEFAULT_LIVING_ANSWERS : null,
  };
}
