import { beforeEach, describe, expect, it, vi } from "vitest";
import { createManualMission } from "@/api/mission";
import { markMissionCreationStarted } from "@/app/mission/new/utils/mission-creation-history";
import { fireEvent, render, screen, waitFor } from "@/lib/test/react";
import ManualMissionPage from "./page";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));

vi.mock("@/api/mission", () => ({
  completeMission: vi.fn(),
  createManualMission: vi.fn(),
  deleteRecommendedMission: vi.fn(),
  fetchMissions: vi.fn(),
}));

vi.mock("@/app/mission/new/utils/mission-creation-history", () => ({
  markMissionCreationStarted: vi.fn(),
}));

const CREATED_MISSION = {
  id: "manual-1",
  source: "MANUAL" as const,
  category: "MEAL" as const,
  title: "저녁은 집밥으로 해결하기",
  status: "ACTIVE" as const,
  weekEndsAt: "2099-01-01T00:00:00Z",
};

describe("ManualMissionPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createManualMission).mockResolvedValue(CREATED_MISSION);
    vi.mocked(markMissionCreationStarted).mockResolvedValue(undefined);
  });

  it("카테고리와 미션 내용을 입력해 수동 미션을 추가한다", async () => {
    render(<ManualMissionPage />);

    const submitButton = screen.getByRole("button", { name: "완료" });
    expect(submitButton).toBeDisabled();

    fireEvent.click(screen.getByRole("radio", { name: "식비" }));
    fireEvent.change(screen.getByRole("textbox", { name: "미션 내용" }), {
      target: { value: "  저녁은 집밥으로 해결하기  " },
    });
    expect(screen.getByText("17/30")).toBeInTheDocument();
    await waitFor(() => expect(submitButton).toBeEnabled());

    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(createManualMission).toHaveBeenCalledWith({
        category: "MEAL",
        text: "저녁은 집밥으로 해결하기",
      }),
    );
    expect(pushMock).toHaveBeenCalledWith("/mission");
    expect(markMissionCreationStarted).toHaveBeenCalledOnce();
  });

  it("미션 내용은 30자로 제한하고 공백만 있으면 완료할 수 없다", () => {
    render(<ManualMissionPage />);

    fireEvent.click(screen.getByRole("radio", { name: "취미" }));
    const input = screen.getByRole("textbox", { name: "미션 내용" });
    fireEvent.change(input, { target: { value: "   " } });
    expect(screen.getByRole("button", { name: "완료" })).toBeDisabled();

    fireEvent.change(input, { target: { value: "가".repeat(31) } });
    expect(input).toHaveValue("가".repeat(30));
    expect(screen.getByText("30/30")).toBeInTheDocument();
  });

  it("추가 실패를 안내하고 같은 입력으로 다시 시도할 수 있다", async () => {
    vi.mocked(createManualMission).mockRejectedValueOnce(new Error("network"));
    render(<ManualMissionPage />);

    fireEvent.click(screen.getByRole("radio", { name: "생활" }));
    fireEvent.change(screen.getByRole("textbox", { name: "미션 내용" }), {
      target: { value: "무지출 데이 만들기" },
    });
    const submitButton = screen.getByRole("button", { name: "완료" });
    await waitFor(() => expect(submitButton).toBeEnabled());
    fireEvent.click(submitButton);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "미션을 추가하지 못했어요. 잠시 후 다시 시도해 주세요.",
    );
    expect(screen.getByRole("button", { name: "완료" })).toBeEnabled();
  });

  it("뒤로가기로 미션 목록으로 이동한다", () => {
    render(<ManualMissionPage />);

    fireEvent.click(screen.getByRole("button", { name: "미션 목록으로 돌아가기" }));

    expect(pushMock).toHaveBeenCalledWith("/mission");
  });
});
