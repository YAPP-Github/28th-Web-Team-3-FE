import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QuestionHeader } from "./question-header";

const navigation = vi.hoisted(() => ({
  pathname: "/onboarding/age",
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: navigation.push }),
}));

describe("QuestionHeader", () => {
  beforeEach(() => {
    navigation.pathname = "/onboarding/age";
    navigation.push.mockClear();
  });

  it("첫 질문에서 이전 단계 버튼을 누르면 인트로로 이동한다", () => {
    render(<QuestionHeader />);

    fireEvent.click(screen.getByRole("button", { name: "이전 단계" }));

    expect(navigation.push).toHaveBeenCalledWith("/onboarding/intro");
  });

  it("다음 질문에서는 바로 전 질문으로 이동한다", () => {
    navigation.pathname = "/onboarding/month";
    render(<QuestionHeader />);

    fireEvent.click(screen.getByRole("button", { name: "이전 단계" }));

    expect(navigation.push).toHaveBeenCalledWith("/onboarding/age");
  });
});
