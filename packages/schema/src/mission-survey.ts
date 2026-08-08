import { z } from "zod";
import { missionCategorySchema } from "./mission";

/**
 * 미션 생성 사전 설문 API 계약 — 백엔드 OpenAPI(`/api/missions/surveys`) 기준.
 * 질문 조회: GET /api/missions/surveys/questions
 * 설문 저장·교체: PUT /api/missions/surveys
 * 저장 설문 조회: GET /api/missions/surveys
 */

export const missionSurveyAnswerTypeSchema = z.enum([
  "SINGLE_CHOICE",
  "MULTI_CHOICE",
  "NUMBER",
  "FREQUENCY_RANGE",
  "KEYED_NUMBER",
  "KEYED_FREQUENCY_RANGE",
]);
export type MissionSurveyAnswerType = z.infer<typeof missionSurveyAnswerTypeSchema>;

export const missionSurveyFrequencyUnitSchema = z.enum([
  "TIMES_PER_WEEK",
  "TIMES_PER_FOUR_WEEKS",
  "SUBSCRIPTION_COUNT",
  "DAYS_PER_WEEK",
]);
export type MissionSurveyFrequencyUnit = z.infer<typeof missionSurveyFrequencyUnitSchema>;

export const missionSurveyOptionSchema = z.object({
  code: z.string(),
  label: z.string(),
});
export type MissionSurveyOption = z.infer<typeof missionSurveyOptionSchema>;

export const missionSurveyNumericRuleSchema = z.object({
  subjectOptionCode: z.string(),
  unit: missionSurveyFrequencyUnitSchema,
  minimum: z.number().int(),
  maximum: z.number().int(),
});
export type MissionSurveyNumericRule = z.infer<typeof missionSurveyNumericRuleSchema>;

export const missionSurveyFrequencyRangeCodeSchema = z.enum([
  "ONE",
  "TWO",
  "THREE_OR_MORE",
  "ONE_TO_TWO",
  "THREE_TO_FOUR",
  "FIVE_TO_SIX",
  "SEVEN_OR_MORE",
]);
export type MissionSurveyFrequencyRangeCode = z.infer<typeof missionSurveyFrequencyRangeCodeSchema>;

export const missionSurveyFrequencyRangeOptionSchema = z.object({
  code: missionSurveyFrequencyRangeCodeSchema,
  label: z.string(),
  minimum: z.number().int(),
  maximum: z.number().int().nullable(),
});
export type MissionSurveyFrequencyRangeOption = z.infer<
  typeof missionSurveyFrequencyRangeOptionSchema
>;

export const missionSurveyFrequencyRangeRuleSchema = z.object({
  subjectOptionCode: z.string(),
  unit: missionSurveyFrequencyUnitSchema,
  options: z.array(missionSurveyFrequencyRangeOptionSchema),
});
export type MissionSurveyFrequencyRangeRule = z.infer<typeof missionSurveyFrequencyRangeRuleSchema>;

export const missionSurveyTextRuleSchema = z.object({
  subjectOptionCode: z.string(),
  minimumLength: z.number().int(),
  maximumLength: z.number().int(),
});
export type MissionSurveyTextRule = z.infer<typeof missionSurveyTextRuleSchema>;

export const missionSurveyConditionalOptionRuleSchema = z.object({
  dependsOnQuestionCode: z.string(),
  whenOptionCodes: z.array(z.string()),
  allowedOptionCodes: z.array(z.string()),
});
export type MissionSurveyConditionalOptionRule = z.infer<
  typeof missionSurveyConditionalOptionRuleSchema
>;

export const missionSurveyQuestionSchema = z.object({
  code: z.string(),
  prompt: z.string(),
  answerType: missionSurveyAnswerTypeSchema,
  options: z.array(missionSurveyOptionSchema),
  minSelections: z.number().int().nullable(),
  maxSelections: z.number().int().nullable(),
  dependsOnQuestionCode: z.string().nullable(),
  skipWhenOptionCodes: z.array(z.string()),
  numericRules: z.array(missionSurveyNumericRuleSchema),
  textRules: z.array(missionSurveyTextRuleSchema),
  frequencyRangeOptions: z.array(missionSurveyFrequencyRangeOptionSchema).optional(),
  frequencyRangeRules: z.array(missionSurveyFrequencyRangeRuleSchema).optional(),
  exclusiveOptionCodes: z.array(z.string()),
  conditionalOptionRules: z.array(missionSurveyConditionalOptionRuleSchema),
  impacts: z.array(z.string()),
});
export type MissionSurveyQuestion = z.infer<typeof missionSurveyQuestionSchema>;

export const missionSurveyCategoryQuestionsSchema = z.object({
  category: missionCategorySchema,
  questions: z.array(missionSurveyQuestionSchema),
});
export type MissionSurveyCategoryQuestions = z.infer<typeof missionSurveyCategoryQuestionsSchema>;

/** GET /api/missions/surveys/questions 응답. */
export const missionSurveyQuestionsResponseSchema = z.object({
  categories: z.array(missionSurveyCategoryQuestionsSchema),
});
export type MissionSurveyQuestionsResponse = z.infer<typeof missionSurveyQuestionsResponseSchema>;

// --- 카테고리별 답변(요청/응답 공용 — 필드 형태가 동일하다) ---

export const mealSurveyAnswersSchema = z.object({
  target: z.string(),
  weeklyFrequency: z.number().int().nullable().optional(),
  weeklyFrequencyRange: missionSurveyFrequencyRangeCodeSchema.nullable().optional(),
  alternatives: z.array(z.string()),
  reason: z.string().nullable().optional(),
  exclusions: z.array(z.string()),
});
export type MealSurveyAnswers = z.infer<typeof mealSurveyAnswersSchema>;

export const transportSurveyAnswersSchema = z.object({
  primaryMode: z.string(),
  target: z.string(),
  weeklyFrequency: z.number().int().nullable().optional(),
  weeklyFrequencyRange: missionSurveyFrequencyRangeCodeSchema.nullable().optional(),
  reason: z.string(),
  exclusions: z.array(z.string()),
});
export type TransportSurveyAnswers = z.infer<typeof transportSurveyAnswersSchema>;

export const hobbyFrequencySchema = z.object({
  spendingType: z.string(),
  frequencyRange: missionSurveyFrequencyRangeCodeSchema,
});
export type HobbyFrequency = z.infer<typeof hobbyFrequencySchema>;

export const hobbySurveyAnswersSchema = z.object({
  hobbies: z.array(z.string()),
  otherHobby: z.string().nullable().optional(),
  spendingTypes: z.array(z.string()),
  monthlySpendingRange: z.string().nullable().optional(),
  frequencies: z.array(hobbyFrequencySchema),
  savingMethods: z.array(z.string()),
});
export type HobbySurveyAnswers = z.infer<typeof hobbySurveyAnswersSchema>;

export const livingFrequencySchema = z.object({
  area: z.string(),
  frequencyRange: missionSurveyFrequencyRangeCodeSchema,
});
export type LivingFrequency = z.infer<typeof livingFrequencySchema>;

export const livingSurveyAnswersSchema = z.object({
  areas: z.array(z.string()),
  monthlySpendingRange: z.string().nullable().optional(),
  frequencies: z.array(livingFrequencySchema),
  trigger: z.string(),
  savingMethods: z.array(z.string()),
});
export type LivingSurveyAnswers = z.infer<typeof livingSurveyAnswersSchema>;

/** PUT /api/missions/surveys 요청 — 선택하지 않은 카테고리는 생략하거나 null. */
export const missionSurveyPutRequestSchema = z.object({
  meal: mealSurveyAnswersSchema.nullable().optional(),
  transport: transportSurveyAnswersSchema.nullable().optional(),
  hobby: hobbySurveyAnswersSchema.nullable().optional(),
  living: livingSurveyAnswersSchema.nullable().optional(),
});
export type MissionSurveyPutRequest = z.infer<typeof missionSurveyPutRequestSchema>;

/** GET /api/missions/surveys 응답. */
export const missionSurveyResponseSchema = z.object({
  schemaVersion: z.string(),
  meal: mealSurveyAnswersSchema.nullable(),
  transport: transportSurveyAnswersSchema.nullable(),
  hobby: hobbySurveyAnswersSchema.nullable(),
  living: livingSurveyAnswersSchema.nullable(),
});
export type MissionSurveyResponse = z.infer<typeof missionSurveyResponseSchema>;
