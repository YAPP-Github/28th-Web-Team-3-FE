import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@/lib/test/react";
import { WithdrawalButton } from "./withdrawal-button";

vi.mock("@/api/auth", () => ({ withdrawGuest: vi.fn() }));

import { withdrawGuest } from "@/api/auth";

describe("WithdrawalButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(withdrawGuest).mockResolvedValue();
  });

  it("설정 항목과 같은 크기의 gray-300 탈퇴 버튼과 구분선을 보여준다", () => {
    render(<WithdrawalButton />);

    const button = screen.getByRole("button", { name: "탈퇴하기" });
    expect(button).toHaveClass("text-body-b1-500", "text-gray-300");
    expect(button.parentElement).toHaveClass("border-gray-100", "border-t");
  });

  it("탈퇴 버튼을 누르면 미션 완료와 같은 형식의 확인 다이얼로그를 연다", () => {
    render(<WithdrawalButton />);

    fireEvent.click(screen.getByRole("button", { name: "탈퇴하기" }));

    expect(screen.getByRole("dialog", { name: "정말 탈퇴할까요?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "탈퇴하기" })).toBeInTheDocument();
  });

  it("확인해야 탈퇴 API를 호출하고 성공 동작을 실행한다", async () => {
    const onWithdrawn = vi.fn();
    render(<WithdrawalButton onWithdrawn={onWithdrawn} />);

    fireEvent.click(screen.getByRole("button", { name: "탈퇴하기" }));
    fireEvent.click(screen.getByRole("button", { name: "탈퇴하기" }));

    await waitFor(() => expect(withdrawGuest).toHaveBeenCalledOnce());
    expect(onWithdrawn).toHaveBeenCalledOnce();
  });

  it("탈퇴 실패를 안내하고 다이얼로그를 열어 둔다", async () => {
    vi.mocked(withdrawGuest).mockRejectedValue(new Error("network error"));
    render(<WithdrawalButton />);

    fireEvent.click(screen.getByRole("button", { name: "탈퇴하기" }));
    fireEvent.click(screen.getByRole("button", { name: "탈퇴하기" }));

    expect(
      await screen.findByText("탈퇴하지 못했어요. 잠시 후 다시 시도해주세요."),
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "정말 탈퇴할까요?" })).toBeInTheDocument();
  });
});
