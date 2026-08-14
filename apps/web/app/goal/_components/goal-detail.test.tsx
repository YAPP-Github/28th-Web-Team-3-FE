import type { GoalStatus } from "@repo/schema/goal";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, createTestQueryClient, fireEvent, render, screen, waitFor } from "@/lib/test/react";

// API 함수만 목으로 대체하고 실제 Query options 경로의 렌더·인터랙션을 검증한다.
const MOCK_GOAL: GoalStatus = {
  targetAmountManwon: 5000,
  periodMonths: 16,
  totalSavedManwon: 1950,
  progressPercent: 100,
  usageMonths: 8,
  deadlineDDay: 486,
  thisMonth: { targetManwon: 82, savedManwon: 67, progressPercent: 82, dDay: 12 },
  monthlySavings: [
    { yearMonth: "2026-05", savedManwon: 71, current: false },
    { yearMonth: "2026-06", savedManwon: 80, current: false },
    { yearMonth: "2026-07", savedManwon: 0, current: false },
    { yearMonth: "2026-08", savedManwon: 67, current: true },
  ],
};

vi.mock("@/api/goal", () => ({
  fetchGoalStatus: vi.fn(),
  updateGoal: vi.fn(),
  updateSavings: vi.fn(),
}));

vi.mock("@/api/onboarding", () => ({
  getOnboardingProfile: vi.fn(),
  patchOnboardingProfile: vi.fn(),
}));

import { fetchGoalStatus, updateGoal, updateSavings } from "@/api/goal";
import { getOnboardingProfile, patchOnboardingProfile } from "@/api/onboarding";
import { SAVE_FAILED_TEXT } from "@/lib/messages";
import { goalStatusOptions } from "@/lib/queries/goal";
import { GoalDetail } from "./goal-detail";

describe("GoalDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchGoalStatus).mockResolvedValue(MOCK_GOAL);
    vi.mocked(updateGoal).mockResolvedValue(MOCK_GOAL);
    vi.mocked(updateSavings).mockResolvedValue(MOCK_GOAL);
  });

  it("목표 현황을 제목·게이지·스탯 카드로 렌더한다", async () => {
    render(<GoalDetail />);

    expect(await screen.findByText("5,000만원 모으기")).toBeInTheDocument();
    expect(screen.getByText("1,950만원")).toBeInTheDocument();
    expect(screen.getByText("39%")).toBeInTheDocument();
    expect(screen.getByText("8개월째")).toBeInTheDocument();
    expect(screen.getByText("D-486")).toBeInTheDocument();
  });

  it("월별 저축 현황과 이번 달 목표·달성 금액을 렌더한다", async () => {
    render(<GoalDetail />);

    expect(await screen.findByRole("heading", { name: "월별 저축 현황" })).toBeInTheDocument();
    expect(screen.getByText("5월")).toBeInTheDocument();
    expect(screen.getByText("이번 달")).toBeInTheDocument();
    expect(screen.getByText("목표: 82만원")).toBeInTheDocument();
    expect(screen.getByText("달성: 67만원")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "월별 저축 현황" })).toBeInTheDocument();
  });

  it("서버 달성률이 100이어도 전체 목표금액 기준으로 달성률을 다시 계산한다", async () => {
    render(<GoalDetail />);

    expect(await screen.findByText("5,000만원 모으기")).toBeInTheDocument();
    expect(screen.getByText("39%")).toBeInTheDocument();
  });

  it("현재 저축액 입력 버튼이 시트를 연다", async () => {
    render(<GoalDetail />);

    await screen.findByText("5,000만원 모으기");
    fireEvent.click(screen.getByRole("button", { name: "현재 저축액 입력" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("목표 수정은 목표 API만 사용한다", async () => {
    render(<GoalDetail />);

    await screen.findByText("5,000만원 모으기");
    fireEvent.click(screen.getByRole("button", { name: /수정/ }));
    expect(screen.getByRole("dialog", { name: "수정" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "목표 금액만원" })).toHaveValue("5000");
    expect(screen.getByRole("textbox", { name: "목표 기간개월" })).toHaveValue("16");
    expect(screen.queryByRole("textbox", { name: "월소득만원" })).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox", { name: "목표 금액만원" }), {
      target: { value: "6000" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "목표 기간개월" }), {
      target: { value: "24" },
    });
    fireEvent.click(screen.getByRole("button", { name: "완료" }));

    await waitFor(() =>
      expect(updateGoal).toHaveBeenCalledWith({
        targetAmountManwon: 6000,
        periodMonths: 24,
      }),
    );
    expect(getOnboardingProfile).not.toHaveBeenCalled();
    expect(patchOnboardingProfile).not.toHaveBeenCalled();
  });

  it("목표 저장이 실패하면 오류를 보여준다", async () => {
    vi.mocked(updateGoal).mockRejectedValue(new Error("network error"));
    render(<GoalDetail />);

    await screen.findByText("5,000만원 모으기");
    fireEvent.click(screen.getByRole("button", { name: /수정/ }));
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "목표 기간개월" })).toHaveValue("16"),
    );
    fireEvent.click(screen.getByRole("button", { name: "완료" }));

    expect(await screen.findByText(SAVE_FAILED_TEXT)).toBeInTheDocument();
    expect(patchOnboardingProfile).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "수정" })).toBeInTheDocument();
  });

  it("목표 기간이 하한 미만이면 보내지 않고 오류를 표시한다", async () => {
    render(<GoalDetail />);

    await screen.findByText("5,000만원 모으기");
    fireEvent.click(screen.getByRole("button", { name: /수정/ }));
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "목표 기간개월" })).toHaveValue("16"),
    );

    fireEvent.change(screen.getByRole("textbox", { name: "목표 기간개월" }), {
      target: { value: "2" },
    });
    fireEvent.click(screen.getByRole("button", { name: "완료" }));

    expect(screen.getByText("목표 기간은 3개월 이상으로 입력해주세요.")).toBeInTheDocument();
    expect(updateGoal).not.toHaveBeenCalled();
  });

  it("목표 기간 상한을 넘겨 입력하면 최대값으로 제한한다", async () => {
    render(<GoalDetail />);

    await screen.findByText("5,000만원 모으기");
    fireEvent.click(screen.getByRole("button", { name: /수정/ }));
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "목표 기간개월" })).toHaveValue("16"),
    );

    fireEvent.change(screen.getByRole("textbox", { name: "목표 기간개월" }), {
      target: { value: "100" },
    });

    expect(screen.getByRole("textbox", { name: "목표 기간개월" })).toHaveValue("36");
  });

  it("저장에 실패하면 시트에 오류를 표시한다", async () => {
    vi.mocked(updateSavings).mockRejectedValue(new Error("bad request"));
    render(<GoalDetail />);

    await screen.findByText("5,000만원 모으기");
    fireEvent.click(screen.getByRole("button", { name: "현재 저축액 입력" }));
    fireEvent.click(screen.getByRole("button", { name: "완료" }));

    expect(await screen.findByText(SAVE_FAILED_TEXT)).toBeInTheDocument();
  });

  it("현재저축액 입력은 목표금액을 수정하지 않는다", async () => {
    render(<GoalDetail />);

    await screen.findByText("5,000만원 모으기");
    fireEvent.click(screen.getByRole("button", { name: "현재 저축액 입력" }));
    fireEvent.change(screen.getByRole("textbox", { name: "저축액만원" }), {
      target: { value: "100" },
    });
    fireEvent.click(screen.getByRole("button", { name: "완료" }));

    await waitFor(() => expect(updateSavings).toHaveBeenCalledWith({ savedAmountManwon: 100 }));
    expect(updateGoal).not.toHaveBeenCalled();
  });

  // 시트는 열려 있는 동안에도 서버 값이 바뀔 수 있다 — 재접속 재조회, 다른 화면의 갱신 등.
  // 입력을 아직 안 했으면 최신 값을 따라가야 하고, 입력한 뒤에는 그 값을 덮으면 안 된다.
  describe("시트 입력 보존", () => {
    /** 백그라운드 재조회로 목표 현황이 바뀐 상황. 화면에 도달한 것까지 확인하고 돌아온다. */
    async function refetchGoal(
      queryClient: ReturnType<typeof createTestQueryClient>,
      goal: GoalStatus,
    ) {
      await act(async () => {
        queryClient.setQueryData(goalStatusOptions().queryKey, goal);
      });
      // 갱신이 닿기 전에 단언하면 통과해도 아무것도 증명하지 못한다.
      await waitFor(() =>
        expect(
          screen.getByText(`${goal.targetAmountManwon.toLocaleString()}만원 모으기`),
        ).toBeInTheDocument(),
      );
    }

    it("저축액을 입력한 뒤 목표 현황이 갱신돼도 입력을 유지한다", async () => {
      const queryClient = createTestQueryClient();
      render(<GoalDetail />, { queryClient });

      await screen.findByText("5,000만원 모으기");
      fireEvent.click(screen.getByRole("button", { name: "현재 저축액 입력" }));
      fireEvent.change(screen.getByRole("textbox", { name: "저축액만원" }), {
        target: { value: "100" },
      });

      await refetchGoal(queryClient, {
        ...MOCK_GOAL,
        targetAmountManwon: 7000,
        thisMonth: { ...MOCK_GOAL.thisMonth, savedManwon: 70 },
      });

      expect(screen.getByRole("textbox", { name: "저축액만원" })).toHaveValue("100");
    });

    it("재조회로 값이 바뀌어도 사용자가 입력한 값을 저장한다", async () => {
      const queryClient = createTestQueryClient();
      render(<GoalDetail />, { queryClient });

      await screen.findByText("5,000만원 모으기");
      fireEvent.click(screen.getByRole("button", { name: "현재 저축액 입력" }));
      fireEvent.change(screen.getByRole("textbox", { name: "저축액만원" }), {
        target: { value: "100" },
      });

      await refetchGoal(queryClient, {
        ...MOCK_GOAL,
        targetAmountManwon: 7000,
        thisMonth: { ...MOCK_GOAL.thisMonth, savedManwon: 70 },
      });
      fireEvent.click(screen.getByRole("button", { name: "완료" }));

      // 화면에 남은 값만 맞고 페이로드가 재조회 값으로 가면 사용자는 저장한 줄 알고 속는다.
      await waitFor(() => expect(updateSavings).toHaveBeenCalledWith({ savedAmountManwon: 100 }));
    });

    it("저축액 시트를 다시 열면 최신 저축액으로 되돌린다", async () => {
      const queryClient = createTestQueryClient();
      render(<GoalDetail />, { queryClient });

      await screen.findByText("5,000만원 모으기");
      fireEvent.click(screen.getByRole("button", { name: "현재 저축액 입력" }));
      fireEvent.change(screen.getByRole("textbox", { name: "저축액만원" }), {
        target: { value: "100" },
      });
      fireEvent.keyDown(document, { key: "Escape" });
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

      await refetchGoal(queryClient, {
        ...MOCK_GOAL,
        targetAmountManwon: 7000,
        thisMonth: { ...MOCK_GOAL.thisMonth, savedManwon: 70 },
      });
      fireEvent.click(screen.getByRole("button", { name: "현재 저축액 입력" }));

      expect(screen.getByRole("textbox", { name: "저축액만원" })).toHaveValue("70");
    });

    it("목표 금액을 고친 뒤 목표 현황이 갱신돼도 입력을 유지한다", async () => {
      const queryClient = createTestQueryClient();
      render(<GoalDetail />, { queryClient });

      await screen.findByText("5,000만원 모으기");
      fireEvent.click(screen.getByRole("button", { name: /수정/ }));
      await waitFor(() =>
        expect(screen.getByRole("textbox", { name: "목표 기간개월" })).toHaveValue("16"),
      );
      fireEvent.change(screen.getByRole("textbox", { name: "목표 금액만원" }), {
        target: { value: "6000" },
      });

      await refetchGoal(queryClient, { ...MOCK_GOAL, targetAmountManwon: 7000 });

      expect(screen.getByRole("textbox", { name: "목표 금액만원" })).toHaveValue("6000");
    });

    it("목표 기간을 고친 뒤 목표 현황이 갱신돼도 입력을 유지한다", async () => {
      const queryClient = createTestQueryClient();
      render(<GoalDetail />, { queryClient });

      await screen.findByText("5,000만원 모으기");
      fireEvent.click(screen.getByRole("button", { name: /수정/ }));
      fireEvent.change(screen.getByRole("textbox", { name: "목표 기간개월" }), {
        target: { value: "20" },
      });
      await refetchGoal(queryClient, {
        ...MOCK_GOAL,
        targetAmountManwon: 7000,
        periodMonths: 24,
      });

      expect(screen.getByRole("textbox", { name: "목표 기간개월" })).toHaveValue("20");
    });

    it("목표수정 시트를 다시 열면 최신 값으로 되돌린다", async () => {
      const queryClient = createTestQueryClient();
      render(<GoalDetail />, { queryClient });

      await screen.findByText("5,000만원 모으기");
      fireEvent.click(screen.getByRole("button", { name: /수정/ }));
      await waitFor(() =>
        expect(screen.getByRole("textbox", { name: "목표 기간개월" })).toHaveValue("16"),
      );
      fireEvent.change(screen.getByRole("textbox", { name: "목표 금액만원" }), {
        target: { value: "6000" },
      });
      fireEvent.change(screen.getByRole("textbox", { name: "목표 기간개월" }), {
        target: { value: "20" },
      });
      fireEvent.keyDown(document, { key: "Escape" });
      await waitFor(() =>
        expect(screen.queryByRole("dialog", { name: "수정" })).not.toBeInTheDocument(),
      );

      await refetchGoal(queryClient, {
        ...MOCK_GOAL,
        targetAmountManwon: 7000,
        periodMonths: 24,
      });
      fireEvent.click(screen.getByRole("button", { name: /수정/ }));

      expect(screen.getByRole("textbox", { name: "목표 금액만원" })).toHaveValue("7000");
      expect(screen.getByRole("textbox", { name: "목표 기간개월" })).toHaveValue("24");
    });
  });
});
