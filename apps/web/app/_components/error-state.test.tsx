import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@/lib/test/react";
import { ErrorState, RetryButton } from "./error-state";

describe("ErrorState", () => {
  it("오류 제목·설명과 전달된 동작을 표시한다", () => {
    render(
      <ErrorState
        action={<RetryButton onClick={vi.fn()} />}
        description="다시 시도해 주세요."
        title="문제가 생겼어요"
      />,
    );

    expect(screen.getByRole("heading", { name: "문제가 생겼어요" })).toBeInTheDocument();
    expect(screen.getByText("다시 시도해 주세요.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeInTheDocument();
  });

  it("재시도 버튼은 전달된 핸들러를 호출한다", () => {
    const onClick = vi.fn();
    render(<RetryButton onClick={onClick} />);

    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
