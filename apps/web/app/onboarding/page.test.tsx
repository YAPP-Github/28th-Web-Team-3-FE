import { describe, expect, it, vi } from "vitest";

const { redirect } = vi.hoisted(() => ({ redirect: vi.fn() }));

vi.mock("next/navigation", () => ({ redirect }));

import OnboardingPage from "./page";

describe("OnboardingPage", () => {
  it("인트로 경로로 이동한다", () => {
    OnboardingPage();

    expect(redirect).toHaveBeenCalledWith("/onboarding/intro");
  });
});
