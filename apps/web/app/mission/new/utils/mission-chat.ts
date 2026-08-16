import {
  type ActiveMissionCategory,
  activeMissionCategorySchema,
  missionItemSchema,
} from "@repo/schema/mission";
import {
  missionBaselineAmountWonSchema,
  missionBaselineFrequencySchema,
  missionGenerationCreateRequestSchema,
} from "@repo/schema/mission-generation";
import { z } from "zod";
import type { MissionCreationCategory } from "@/app/mission/constants/mission-creation";

export const MISSION_CHAT_QUESTION_COUNT = 4;
export const MISSION_CHAT_TYPING_DELAY_MS = 1_100;

export const MISSION_FREQUENCY_OPTIONS = [
  { label: "1회", value: "1" },
  { label: "3회", value: "3" },
  { label: "5회", value: "5" },
  { label: "7회", value: "7" },
] as const;

const numericInputSchema = z.string().regex(/^\d+$/).transform(Number);

export const missionChatFormSchema = z
  .object({
    category: activeMissionCategorySchema,
    item: missionItemSchema,
    baselineFrequency: numericInputSchema.pipe(missionBaselineFrequencySchema),
    baselineAmountWon: numericInputSchema.pipe(missionBaselineAmountWonSchema),
  })
  .pipe(missionGenerationCreateRequestSchema);

export type MissionChatFormInput = z.input<typeof missionChatFormSchema>;

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function formatWonInput(value: string) {
  const digits = digitsOnly(value);
  return digits ? Number(digits).toLocaleString("ko-KR") : "";
}

export function categoryQuestion(category: MissionCreationCategory | undefined) {
  return `${category ?? "선택한 카테고리"}는 어떤 항목을 줄이고 싶으세요?`;
}

export function frequencyQuestion(itemLabel: string | undefined) {
  return `평소 ${itemLabel ?? "선택한 항목"}은 몇 번 이용하세요?`;
}

export function amountQuestion(itemLabel: string | undefined) {
  return `평소 ${itemLabel ?? "선택한 항목"}으로 얼마 쓰세요?`;
}

export function findCategoryName(
  categoryCode: ActiveMissionCategory | undefined,
  categories: readonly { name: MissionCreationCategory }[],
  codes: Record<MissionCreationCategory, ActiveMissionCategory>,
) {
  return categories.find(({ name }) => codes[name] === categoryCode)?.name;
}
