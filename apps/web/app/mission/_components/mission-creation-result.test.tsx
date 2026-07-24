import type { MissionDraftsResponse } from "@repo/schema/mission-generation";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));

const MOCK_DRAFTS: MissionDraftsResponse = {
  jobId: "job-1",
  categories: [
    {
      category: "MEAL",
      drafts: [
        {
          id: "draft-1",
          title: "이번 주 배달음식 2회 이하로 주문",
          description: "",
          actionCode: "REDUCE",
          metricType: "COUNT",
          targetCount: 2,
          targetUnit: "TIMES_PER_WEEK",
          estimatedSavingsWon: 5000,
          savingsEstimateVersion: "V1",
          savingsLabel: "약 5,000원 절약 예상",
        },
      ],
    },
  ],
};

const confirmMutate = vi.fn();
const confirmIsError = false;

vi.mock("@/app/mission/generation-queries", () => ({
  useGenerationDrafts: () => ({ data: MOCK_DRAFTS, isPending: false, isError: false }),
  useConfirmGenerationJob: () => ({ mutate: confirmMutate, isError: confirmIsError }),
}));

import { MissionCreationResult } from "./mission-creation-result";

describe("MissionCreationResult", () => {
  it("미션을 고르면 다음 버튼을 활성화하고 확정 요청 후 미션 홈으로 이동한다", () => {
    render(<MissionCreationResult jobId="job-1" />);

    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "이번 주 배달음식 2회 이하로 주문" }));
    expect(screen.getByRole("button", { name: "다음" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    expect(confirmMutate).toHaveBeenCalledWith(
      { selectedDraftIds: ["draft-1"] },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });
});
