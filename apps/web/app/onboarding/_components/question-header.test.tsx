import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QuestionHeader } from "./question-header";

const routerState = vi.hoisted(() => ({
  pathname: "/onboarding/age",
  replaceMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => routerState.pathname,
  useRouter: () => ({ replace: routerState.replaceMock }),
}));

describe("QuestionHeader", () => {
  beforeEach(() => {
    routerState.pathname = "/onboarding/age";
    routerState.replaceMock.mockClear();
  });

  it("첫 질문에서 이전 단계 버튼을 누르면 인트로로 이동한다", () => {
    render(<QuestionHeader />);

    fireEvent.click(screen.getByRole("button", { name: "이전 단계" }));

    expect(routerState.replaceMock).toHaveBeenCalledWith("/onboarding/intro");
  });

  it("다음 질문에서는 바로 전 질문으로 이동한다", () => {
    routerState.pathname = "/onboarding/month";
    render(<QuestionHeader />);

    fireEvent.click(screen.getByRole("button", { name: "이전 단계" }));

    expect(routerState.replaceMock).toHaveBeenCalledWith("/onboarding/age");
  });
});
