import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import IntroOnboardingPage from "./page";

describe("IntroOnboardingPage", () => {
  it("시작 CTA로 첫 질문 경로를 제공한다", () => {
    render(<IntroOnboardingPage />);

    expect(screen.getByRole("heading", { name: /반가워요!/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "시작" })).toHaveAttribute("href", "/onboarding/age");
  });
});
