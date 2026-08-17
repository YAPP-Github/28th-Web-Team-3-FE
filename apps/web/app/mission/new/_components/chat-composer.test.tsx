import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatComposer } from "./chat-composer";

function renderComposer(onSubmit = vi.fn()) {
  render(
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <ChatComposer
        ariaInvalid={false}
        autoFocus
        disabled={false}
        label="평소 소비 금액"
        maxLength={9}
        name="baselineAmountWon"
        placeholder="소비 입력"
        value="50000"
        onFocus={vi.fn()}
        onValueChange={vi.fn()}
      />
    </form>,
  );

  return onSubmit;
}

describe("ChatComposer", () => {
  it("입력 단계가 열리면 키보드 완료 키와 함께 자동으로 포커스한다", () => {
    renderComposer();

    const input = screen.getByLabelText("평소 소비 금액");
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute("enterkeyhint", "done");
  });

  it("일반 Enter로 현재 답변을 제출한다", () => {
    const onSubmit = renderComposer();

    fireEvent.keyDown(screen.getByLabelText("평소 소비 금액"), { key: "Enter" });

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("IME 조합을 확정하는 Enter는 답변을 제출하지 않는다", () => {
    const onSubmit = renderComposer();

    fireEvent.keyDown(screen.getByLabelText("평소 소비 금액"), {
      isComposing: true,
      key: "Enter",
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
