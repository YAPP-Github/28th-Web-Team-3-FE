import { describe, expect, it } from "vitest";
import { MAX_NET_WORTH_AMOUNT, onboardingFormSchema } from "./onboarding";

const netWorthSchema = onboardingFormSchema.pick({ netWorth: true });

describe("onboardingFormSchema", () => {
  it("숫자가 아닌 순자산 입력은 검증 오류로 처리한다", () => {
    expect(() => netWorthSchema.safeParse({ netWorth: "invalid" })).not.toThrow();
    expect(netWorthSchema.safeParse({ netWorth: "invalid" }).success).toBe(false);
  });

  it("순자산의 최대 금액을 한국어 로케일 메시지와 함께 검증한다", () => {
    const result = netWorthSchema.safeParse({ netWorth: `${MAX_NET_WORTH_AMOUNT}0` });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("금액은 999,999,999,999,999만원 이하여야 해요.");
  });
});
