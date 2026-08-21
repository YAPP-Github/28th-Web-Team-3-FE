import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@/lib/test/react";

const fetchGenerationJobStatus = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }));
vi.mock("@/api/mission-generation", () => ({
  fetchGenerationJobStatus: (jobId: string) => fetchGenerationJobStatus(jobId),
}));

import { MissionLoading } from "./mission-loading";

const PENDING_JOB = {
  confirmed: false,
  draftsAvailable: false,
  expiresAt: null,
  failureCode: null,
  generationSource: null,
  jobId: "job-1",
  pollingIntervalMillis: 2_000,
  status: "PENDING" as const,
};

describe("MissionLoading", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchGenerationJobStatus.mockResolvedValue(PENDING_JOB);
  });

  it("네이티브 앱 복귀 신호를 받으면 생성 상태를 즉시 다시 조회한다", async () => {
    render(<MissionLoading jobId="job-1" />);

    await waitFor(() => expect(fetchGenerationJobStatus).toHaveBeenCalledTimes(1));
    window.dispatchEvent(new Event("akkimo:app-active"));

    await waitFor(() => expect(fetchGenerationJobStatus).toHaveBeenCalledTimes(2));
  });
});
