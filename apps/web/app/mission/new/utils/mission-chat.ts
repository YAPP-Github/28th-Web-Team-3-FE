import {
  type ActiveMissionCategory,
  activeMissionCategorySchema,
  type MissionItem,
  missionItemSchema,
} from "@repo/schema/mission";
import {
  missionBaselineAmountWonSchema,
  missionBaselineFrequencySchema,
  missionGenerationCreateRequestSchema,
} from "@repo/schema/mission-generation";
import { z } from "zod";
import type { MissionCreationCategory } from "@/app/mission/constants/mission-creation";

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

function baselinePeriod(category: MissionCreationCategory | undefined) {
  return category === "생활" || category === "취미" ? "한 달" : "한 주";
}

const QUESTION_PHRASES = {
  DELIVERY_FOOD: {
    frequency: "배달음식은 몇 번 주문하세요?",
    amount: "배달음식 주문에 얼마 쓰세요?",
  },
  DINING_OUT: { frequency: "외식은 몇 번 하세요?", amount: "외식에 얼마 쓰세요?" },
  DRINKING: { frequency: "술자리는 몇 번 가지세요?", amount: "술자리에 얼마 쓰세요?" },
  CAFE: { frequency: "카페는 몇 번 이용하세요?", amount: "카페에 얼마 쓰세요?" },
  SNACK: { frequency: "간식은 몇 번 구매하세요?", amount: "간식 구매에 얼마 쓰세요?" },
  CONVENIENCE_STORE: { frequency: "편의점은 몇 번 이용하세요?", amount: "편의점에서 얼마 쓰세요?" },
  CLOTHING: { frequency: "의류는 몇 번 구매하세요?", amount: "의류 구매에 얼마 쓰세요?" },
  COSMETICS: { frequency: "화장품은 몇 번 구매하세요?", amount: "화장품 구매에 얼마 쓰세요?" },
  HOUSEHOLD_GOODS: {
    frequency: "생활용품은 몇 번 구매하세요?",
    amount: "생활용품 구매에 얼마 쓰세요?",
  },
  BEAUTY: { frequency: "미용 서비스는 몇 번 이용하세요?", amount: "미용 서비스에 얼마 쓰세요?" },
  SELF_DEVELOPMENT: {
    frequency: "자기계발 활동은 몇 번 참여하세요?",
    amount: "자기계발 활동에 얼마 쓰세요?",
  },
  HOBBY_GOODS: {
    frequency: "취미용품은 몇 번 구매하세요?",
    amount: "취미용품 구매에 얼마 쓰세요?",
  },
  GAME: { frequency: "게임에는 몇 번 결제하세요?", amount: "게임에 얼마 결제하세요?" },
  DIGITAL_CONTENT: {
    frequency: "디지털 콘텐츠에는 몇 번 결제하세요?",
    amount: "디지털 콘텐츠에 얼마 결제하세요?",
  },
  CLASS: { frequency: "클래스는 몇 번 수강하세요?", amount: "클래스 수강에 얼마 쓰세요?" },
  PERFORMANCE_TICKET: {
    frequency: "공연 티켓은 몇 번 구매하세요?",
    amount: "공연 티켓 구매에 얼마 쓰세요?",
  },
  CLUB_GATHERING: { frequency: "모임에는 몇 번 참여하세요?", amount: "모임에 얼마 쓰세요?" },
  EQUIPMENT_RENTAL: { frequency: "장비는 몇 번 대여하세요?", amount: "장비 대여에 얼마 쓰세요?" },
  SPACE_USE: { frequency: "공간은 몇 번 대여하세요?", amount: "공간 대여에 얼마 쓰세요?" },
} as const satisfies Record<MissionItem, { frequency: string; amount: string }>;

export function frequencyQuestion(
  item: MissionItem | undefined,
  category: MissionCreationCategory | undefined,
) {
  return `평소 ${baselinePeriod(category)}에 ${item ? QUESTION_PHRASES[item].frequency : "선택한 항목은 몇 번 이용하세요?"}`;
}

export function amountQuestion(
  item: MissionItem | undefined,
  category: MissionCreationCategory | undefined,
) {
  return `평소 ${baselinePeriod(category)}에 ${item ? QUESTION_PHRASES[item].amount : "선택한 항목에 얼마 쓰세요?"}`;
}

export function findCategoryName(
  categoryCode: ActiveMissionCategory | undefined,
  categories: readonly { name: MissionCreationCategory }[],
  codes: Record<MissionCreationCategory, ActiveMissionCategory>,
) {
  return categories.find(({ name }) => codes[name] === categoryCode)?.name;
}
