import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@/lib/test/react";
import { WithdrawalButton } from "./withdrawal-button";

vi.mock("@/api/auth", () => ({ withdrawGuest: vi.fn() }));

import { withdrawGuest } from "@/api/auth";

/**
 * `location.replace`는 `writable: false, configurable: false`라 `vi.spyOn`으로 못 잡는다.
 * 반면 `window.location` 자체는 jsdom이 `configurable: true`로 두므로 통째로 갈아끼운다.
 * 원본 서술자를 들고 있다가 되돌려야 이후 테스트가 가짜 location을 물려받지 않는다.
 */
const ORIGINAL_LOCATION = Object.getOwnPropertyDescriptor(window, "location");

function stubLocationReplace() {
  const replace = vi.fn();
  Object.defineProperty(window, "location", { configurable: true, value: { replace } });
  return replace;
}

describe("WithdrawalButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(withdrawGuest).mockResolvedValue();
  });

  afterEach(() => {
    if (ORIGINAL_LOCATION) Object.defineProperty(window, "location", ORIGINAL_LOCATION);
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

  /**
   * 기본 동작은 문서를 새로 여는 것이다 — 그래야 웹의 토큰·쿼리 캐시가 비워지고 네이티브가
   * 새 게스트를 발급한다. 위 테스트는 `onWithdrawn`을 주입해 이 경로를 타지 않는다.
   */
  it("성공하면 온보딩 첫 화면으로 문서를 새로 연다", async () => {
    const replace = stubLocationReplace();
    render(<WithdrawalButton />);

    fireEvent.click(screen.getByRole("button", { name: "탈퇴하기" }));
    fireEvent.click(screen.getByRole("button", { name: "탈퇴하기" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/onboarding/intro"));
  });

  // 실패했는데 화면을 옮기면 사용자는 탈퇴된 줄 안다.
  it("실패하면 화면을 옮기지 않는다", async () => {
    vi.mocked(withdrawGuest).mockRejectedValue(new Error("network error"));
    const replace = stubLocationReplace();
    render(<WithdrawalButton />);

    fireEvent.click(screen.getByRole("button", { name: "탈퇴하기" }));
    fireEvent.click(screen.getByRole("button", { name: "탈퇴하기" }));

    await screen.findByText("탈퇴하지 못했어요. 잠시 후 다시 시도해주세요.");
    expect(replace).not.toHaveBeenCalled();
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
