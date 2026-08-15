import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QuestionHeader } from "./question-header";

const routerState = vi.hoisted(() => ({
  pathname: "/onboarding/age",
  pushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => routerState.pathname,
  useRouter: () => ({ push: routerState.pushMock }),
}));

describe("QuestionHeader", () => {
  beforeEach(() => {
    routerState.pathname = "/onboarding/age";
    routerState.pushMock.mockClear();
  });

  it("첫 질문에서 이전 단계 버튼을 누르면 인트로로 이동한다", () => {
    render(<QuestionHeader />);

    fireEvent.click(screen.getByRole("button", { name: "이전 단계" }));

    expect(routerState.pushMock).toHaveBeenCalledWith("/onboarding/intro");
  });

  it("다음 질문에서는 바로 전 질문으로 이동한다", () => {
    routerState.pathname = "/onboarding/month";
    render(<QuestionHeader />);

    fireEvent.click(screen.getByRole("button", { name: "이전 단계" }));

    expect(routerState.pushMock).toHaveBeenCalledWith("/onboarding/address");
  });

  it("나이 다음 거주지역에서 진행률이 한 단계 증가한다", () => {
    const { rerender } = render(<QuestionHeader />);
    expect(screen.getByRole("progressbar", { name: "온보딩 진행률" })).toHaveAttribute(
      "aria-valuenow",
      "20",
    );

    routerState.pathname = "/onboarding/address";
    rerender(<QuestionHeader />);

    expect(screen.getByRole("progressbar", { name: "온보딩 진행률" })).toHaveAttribute(
      "aria-valuenow",
      "40",
    );
  });
});
