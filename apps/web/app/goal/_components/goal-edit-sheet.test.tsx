import type { GoalSummary } from "@repo/schema/goal";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SAVE_FAILED_TEXT } from "@/lib/messages";
import { fireEvent, render, screen, waitFor } from "@/lib/test/react";
import { GoalEditSheet } from "./goal-edit-sheet";

const UPDATED_GOAL: GoalSummary = {
  targetAmountManwon: 6000,
  periodMonths: 24,
  totalSavedManwon: 1950,
  progressPercent: 33,
  usageMonths: 8,
  deadlineDDay: 486,
  thisMonth: { targetManwon: 82, savedManwon: 67, progressPercent: 82, dDay: 12 },
};

vi.mock("@/api/goal", () => ({
  fetchGoalStatus: vi.fn(),
  updateGoal: vi.fn(),
  updateSavings: vi.fn(),
}));

import { updateGoal } from "@/api/goal";

describe("GoalEditSheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(updateGoal).mockResolvedValue(UPDATED_GOAL);
  });

  it("목표 금액과 기간을 목표 API로 저장한다", async () => {
    const onOpenChange = vi.fn();
    render(
      <GoalEditSheet
        initialPeriodMonths={16}
        initialTargetManwon={5000}
        open
        onOpenChange={onOpenChange}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "목표 금액만원" }), {
      target: { value: "6000" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "목표 기간개월" }), {
      target: { value: "24" },
    });
    fireEvent.click(screen.getByRole("button", { name: "완료" }));

    await waitFor(() =>
      expect(updateGoal).toHaveBeenCalledWith({ targetAmountManwon: 6000, periodMonths: 24 }),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("목표 기간 하한 미만은 저장하지 않는다", () => {
    render(
      <GoalEditSheet
        initialPeriodMonths={16}
        initialTargetManwon={5000}
        open
        onOpenChange={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "목표 기간개월" }), {
      target: { value: "2" },
    });
    fireEvent.click(screen.getByRole("button", { name: "완료" }));

    expect(screen.getByText("목표 기간은 3개월 이상으로 입력해주세요.")).toBeInTheDocument();
    expect(updateGoal).not.toHaveBeenCalled();
  });

  it("목표 기간 상한을 넘기면 최대값으로 제한한다", () => {
    render(
      <GoalEditSheet
        initialPeriodMonths={16}
        initialTargetManwon={5000}
        open
        onOpenChange={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "목표 기간개월" }), {
      target: { value: "100" },
    });

    expect(screen.getByRole("textbox", { name: "목표 기간개월" })).toHaveValue("36");
  });

  it("저장 실패를 시트 안에서 안내한다", async () => {
    vi.mocked(updateGoal).mockRejectedValue(new Error("network error"));
    render(
      <GoalEditSheet
        initialPeriodMonths={16}
        initialTargetManwon={5000}
        open
        onOpenChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "완료" }));

    expect(await screen.findByText(SAVE_FAILED_TEXT)).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "수정" })).toBeInTheDocument();
  });

  it("닫았다 다시 열면 최신 초기값으로 되돌린다", async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <GoalEditSheet
        initialPeriodMonths={16}
        initialTargetManwon={5000}
        open
        onOpenChange={onOpenChange}
      />,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "목표 금액만원" }), {
      target: { value: "6000" },
    });

    rerender(
      <GoalEditSheet
        initialPeriodMonths={24}
        initialTargetManwon={7000}
        open={false}
        onOpenChange={onOpenChange}
      />,
    );
    rerender(
      <GoalEditSheet
        initialPeriodMonths={24}
        initialTargetManwon={7000}
        open
        onOpenChange={onOpenChange}
      />,
    );

    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "목표 금액만원" })).toHaveValue("7000"),
    );
    expect(screen.getByRole("textbox", { name: "목표 기간개월" })).toHaveValue("24");
  });
});
