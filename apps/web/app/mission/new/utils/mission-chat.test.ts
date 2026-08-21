import { describe, expect, it } from "vitest";
import { amountQuestion, frequencyQuestion } from "./mission-chat";

describe("미션 추천 질문", () => {
  it.each([
    [
      "DELIVERY_FOOD",
      "식비",
      "평소 한 주에 배달음식은 몇 번 주문하세요?",
      "평소 한 주에 배달음식 주문에 얼마 쓰세요?",
    ],
    [
      "CLOTHING",
      "생활",
      "평소 한 달에 의류는 몇 번 구매하세요?",
      "평소 한 달에 의류 구매에 얼마 쓰세요?",
    ],
    [
      "BEAUTY",
      "생활",
      "평소 한 달에 미용 서비스는 몇 번 이용하세요?",
      "평소 한 달에 미용 서비스에 얼마 쓰세요?",
    ],
    [
      "GAME",
      "취미",
      "평소 한 달에 게임에는 몇 번 결제하세요?",
      "평소 한 달에 게임에 얼마 결제하세요?",
    ],
    [
      "CLASS",
      "취미",
      "평소 한 달에 클래스는 몇 번 수강하세요?",
      "평소 한 달에 클래스 수강에 얼마 쓰세요?",
    ],
    [
      "EQUIPMENT_RENTAL",
      "취미",
      "평소 한 달에 장비는 몇 번 대여하세요?",
      "평소 한 달에 장비 대여에 얼마 쓰세요?",
    ],
  ] as const)("%s 항목의 질문에 알맞은 동사를 쓴다", (item, category, frequency, amount) => {
    expect(frequencyQuestion(item, category)).toBe(frequency);
    expect(amountQuestion(item, category)).toBe(amount);
  });
});
