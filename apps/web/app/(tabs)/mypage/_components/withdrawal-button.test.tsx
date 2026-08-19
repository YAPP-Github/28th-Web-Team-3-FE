import { bridge, isNativeApp } from "@repo/bridge";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor, within } from "@/lib/test/react";
import { WithdrawalButton } from "./withdrawal-button";

vi.mock("@/api/auth", () => ({ withdrawGuest: vi.fn() }));
vi.mock("@repo/bridge", () => ({
  bridge: { clearGuestTokens: vi.fn() },
  isNativeApp: vi.fn(),
}));

import { withdrawGuest } from "@/api/auth";

const clearGuestTokens = vi.mocked(bridge.clearGuestTokens);

/**
 * `location.replace`는 `writable: false, configurable: false`라 `vi.spyOn`으로 못 잡는다.
 * 반면 `window.location` 자체는 jsdom이 `configurable: true`로 두므로 통째로 갈아끼운다.
 * 원본 서술자를 들고 있다가 되돌려야 이후 테스트가 가짜 location을 물려받지 않는다.
 */
const ORIGINAL_LOCATION = Object.getOwnPropertyDescriptor(window, "location");

const DIALOG_NAME = "정말로 회원탈퇴를 하실건가요?";

/** 행을 눌러 다이얼로그를 열고 다이얼로그 안의 탈퇴하기를 누른다. */
function openAndConfirm() {
  fireEvent.click(screen.getByRole("button", { name: "탈퇴하기" }));
  const dialog = screen.getByRole("dialog", { name: DIALOG_NAME });
  fireEvent.click(within(dialog).getByRole("button", { name: "탈퇴하기" }));
}

function stubLocationReplace() {
  const replace = vi.fn();
  Object.defineProperty(window, "location", { configurable: true, value: { replace } });
  return replace;
}

describe("WithdrawalButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(withdrawGuest).mockResolvedValue();
    vi.mocked(isNativeApp).mockReturnValue(false);
    clearGuestTokens.mockResolvedValue();
  });

  afterEach(() => {
    if (ORIGINAL_LOCATION) Object.defineProperty(window, "location", ORIGINAL_LOCATION);
  });

  it("다른 설정 항목과 같은 행으로 보여준다", () => {
    render(<WithdrawalButton />);

    // 화살표는 다른 화면으로 넘어간다는 표시라 시안이 두지 않았다.
    expect(screen.getByRole("button", { name: "탈퇴하기" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("행을 누르면 확인 다이얼로그를 연다", () => {
    render(<WithdrawalButton />);

    fireEvent.click(screen.getByRole("button", { name: "탈퇴하기" }));

    const dialog = screen.getByRole("dialog", { name: DIALOG_NAME });
    expect(within(dialog).getByRole("button", { name: "아니요" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "탈퇴하기" })).toBeInTheDocument();
  });

  it("확인 다이얼로그에 시안의 경고 버튼 색을 적용한다", () => {
    render(<WithdrawalButton />);

    fireEvent.click(screen.getByRole("button", { name: "탈퇴하기" }));

    const dialog = screen.getByRole("dialog", { name: DIALOG_NAME });
    expect(within(dialog).getByRole("button", { name: "아니요" })).toHaveClass(
      "bg-gray-50",
      "text-gray-800",
    );
    expect(within(dialog).getByRole("button", { name: "탈퇴하기" })).toHaveClass(
      "bg-error-light",
      "text-error",
    );
  });

  // 열자마자 지워지면 안 된다 — 다이얼로그에서 한 번 더 눌러야 요청이 나간다.
  it("다이얼로그를 열기만 해서는 탈퇴하지 않는다", () => {
    render(<WithdrawalButton />);

    fireEvent.click(screen.getByRole("button", { name: "탈퇴하기" }));

    expect(withdrawGuest).not.toHaveBeenCalled();
  });

  it("아니요를 누르면 닫고 탈퇴하지 않는다", () => {
    render(<WithdrawalButton />);
    fireEvent.click(screen.getByRole("button", { name: "탈퇴하기" }));

    fireEvent.click(screen.getByRole("button", { name: "아니요" }));

    expect(screen.queryByRole("dialog", { name: DIALOG_NAME })).not.toBeInTheDocument();
    expect(withdrawGuest).not.toHaveBeenCalled();
  });

  /**
   * 탈퇴는 되돌릴 수 없다. 요청이 도는 동안 같은 요청이 또 나가거나, 결과를 보기 전에
   * 다이얼로그가 닫혀서는 안 된다. 처리 중 표시는 `disabled`가 아니라 `aria-busy`다.
   */
  it("처리 중에는 다시 누르지도, 닫지도 못한다", async () => {
    let finishWithdraw = () => {};
    vi.mocked(withdrawGuest).mockReturnValue(
      new Promise<void>((resolve) => {
        finishWithdraw = resolve;
      }),
    );
    render(<WithdrawalButton onWithdrawn={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "탈퇴하기" }));
    const dialog = screen.getByRole("dialog", { name: DIALOG_NAME });
    const confirm = within(dialog).getByRole("button", { name: "탈퇴하기" });

    fireEvent.click(confirm);
    await waitFor(() => expect(confirm).toHaveAttribute("aria-busy", "true"));

    fireEvent.click(confirm);
    fireEvent.click(within(dialog).getByRole("button", { name: "아니요" }));

    expect(withdrawGuest).toHaveBeenCalledOnce();
    expect(screen.getByRole("dialog", { name: DIALOG_NAME })).toBeInTheDocument();

    await act(async () => {
      finishWithdraw();
    });
  });

  it("확인하면 탈퇴 API를 호출하고 성공 동작을 실행한다", async () => {
    const onWithdrawn = vi.fn();
    render(<WithdrawalButton onWithdrawn={onWithdrawn} />);

    openAndConfirm();

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

    openAndConfirm();

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/onboarding/intro"));
  });

  /**
   * 비우지 않으면 새로 고침 뒤 첫 요청이 방금 삭제된 계정의 access token으로 401을 받고,
   * refresh도 같은 이유로 거부당하고서야 신규 발급으로 넘어간다 — 왕복 두 번이 헛돈다.
   * 네이티브 셸 안에서만 의미가 있으므로 `isNativeApp()`으로 게이팅한다.
   */
  it("네이티브 셸 안이면 문서를 새로 열기 전에 네이티브 토큰을 비운다", async () => {
    vi.mocked(isNativeApp).mockReturnValue(true);
    const replace = stubLocationReplace();
    render(<WithdrawalButton />);

    openAndConfirm();

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/onboarding/intro"));
    expect(clearGuestTokens).toHaveBeenCalledOnce();
  });

  it("네이티브 셸 밖이면 네이티브 토큰을 비우지 않는다", async () => {
    const replace = stubLocationReplace();
    render(<WithdrawalButton />);

    openAndConfirm();

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/onboarding/intro"));
    expect(clearGuestTokens).not.toHaveBeenCalled();
  });

  // 실패했는데 화면을 옮기면 사용자는 탈퇴된 줄 안다.
  it("실패하면 화면을 옮기지 않는다", async () => {
    vi.mocked(withdrawGuest).mockRejectedValue(new Error("network error"));
    const replace = stubLocationReplace();
    render(<WithdrawalButton />);

    openAndConfirm();

    await screen.findByText("탈퇴하지 못했어요. 잠시 후 다시 시도해주세요.");
    expect(replace).not.toHaveBeenCalled();
  });

  it("탈퇴 실패를 안내하고 다이얼로그를 열어 둔다", async () => {
    vi.mocked(withdrawGuest).mockRejectedValue(new Error("network error"));
    render(<WithdrawalButton />);

    openAndConfirm();

    expect(
      await screen.findByText("탈퇴하지 못했어요. 잠시 후 다시 시도해주세요."),
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: DIALOG_NAME })).toBeInTheDocument();
  });
});
