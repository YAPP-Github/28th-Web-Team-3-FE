import { describe, expect, it, vi } from "vitest";

const { redirect } = vi.hoisted(() => ({ redirect: vi.fn() }));

vi.mock("next/navigation", () => ({ redirect }));

import LegacyOnboardingGoalPage from "./page";

describe("LegacyOnboardingGoalPage", () => {
  it("기존 목표 선택 경로를 새 결과 화면으로 보낸다", () => {
    LegacyOnboardingGoalPage();

    expect(redirect).toHaveBeenCalledWith("/onboarding/result");
  });
});
