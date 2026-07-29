import type { MissionDraftsResponse } from "@repo/schema/mission-generation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { confirmGenerationJob, fetchGenerationDrafts } from "@/api/mission-generation";
import { fireEvent, render, screen, waitFor } from "@/lib/test/react";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));

const MOCK_DRAFTS: MissionDraftsResponse = {
  jobId: "job-1",
  categories: [
    {
      category: "MEAL",
      drafts: Array.from({ length: 5 }, (_, index) => ({
        id: `draft-${index + 1}`,
        title: index === 0 ? "이번 주 배달음식 2회 이하로 주문" : `추가 미션 ${index + 1}`,
        description: "",
        actionCode: "REDUCE",
        metricType: "COUNT",
        targetCount: 2,
        targetUnit: "TIMES_PER_WEEK",
        estimatedSavingsWon: 5000,
        savingsEstimateVersion: "V1",
        savingsLabel: "약 5,000원 절약 예상",
      })),
    },
  ],
};

vi.mock("@/api/mission-generation", () => ({
  confirmGenerationJob: vi.fn(),
  fetchGenerationDrafts: vi.fn(),
  fetchGenerationJobStatus: vi.fn(),
  requestGenerationJob: vi.fn(),
}));

import { MissionCreationResult } from "./mission-creation-result";

describe("MissionCreationResult", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchGenerationDrafts).mockResolvedValue(MOCK_DRAFTS);
    vi.mocked(confirmGenerationJob).mockResolvedValue({ jobId: "job-1", missions: [] });
  });

  it("미션을 고르면 다음 버튼을 활성화하고 확정 요청 후 미션 홈으로 이동한다", async () => {
    render(<MissionCreationResult jobId="job-1" />);

    expect(await screen.findByRole("button", { name: "다음" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "이번 주 배달음식 2회 이하로 주문" }));
    expect(screen.getByRole("button", { name: "다음" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    await waitFor(() =>
      expect(confirmGenerationJob).toHaveBeenCalledWith("job-1", {
        selectedDraftIds: ["draft-1"],
      }),
    );
  });

  it("미션 선택 개수를 4개로 제한하지 않는다", async () => {
    render(<MissionCreationResult jobId="job-1" />);

    await screen.findByRole("button", { name: "다음" });
    for (const draft of MOCK_DRAFTS.categories[0]?.drafts ?? []) {
      fireEvent.click(screen.getByRole("button", { name: draft.title }));
    }
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    await waitFor(() =>
      expect(confirmGenerationJob).toHaveBeenCalledWith("job-1", {
        selectedDraftIds: ["draft-1", "draft-2", "draft-3", "draft-4", "draft-5"],
      }),
    );
  });
});
