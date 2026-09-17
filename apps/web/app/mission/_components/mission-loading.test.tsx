import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@/lib/test/react";

const fetchGenerationJobStatus = vi.fn();
const replace = vi.fn();
const push = vi.fn();
const clearPending = vi.fn().mockResolvedValue(undefined);

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, push }) }));
vi.mock("@repo/bridge", () => ({
  isNativeApp: () => true,
  bridge: { clearPendingMissionGeneration: (id: string) => clearPending(id) },
}));
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

  it("완성된 초안은 강제 대기 없이 결과로 이동한다", async () => {
    fetchGenerationJobStatus.mockResolvedValue({
      ...PENDING_JOB,
      status: "SUCCEEDED",
      draftsAvailable: true,
    });
    render(<MissionLoading jobId="job-1" />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/mission/new/result?jobId=job-1"));
  });

  it("생성 실패 작업을 정리한 뒤 새 설문으로 이동한다", async () => {
    fetchGenerationJobStatus.mockResolvedValue({ ...PENDING_JOB, status: "FAILED" });
    render(<MissionLoading jobId="job-1" />);
    fireEvent.click(await screen.findByRole("button", { name: "다시 생성하기" }));
    await waitFor(() => expect(clearPending).toHaveBeenCalledWith("job-1"));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/mission/new"));
  });

  it("조회 실패는 작업을 지우지 않고 수동 재조회로 복구한다", async () => {
    fetchGenerationJobStatus.mockRejectedValueOnce(new Error("offline"));
    render(<MissionLoading jobId="job-1" />);
    expect(await screen.findByText("진행 상태를 확인하지 못했어요.")).toBeTruthy();
    expect(screen.queryByText("미션 생성에 실패했어요.")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "다시 확인하기" }));
    await waitFor(() => expect(fetchGenerationJobStatus).toHaveBeenCalledTimes(2));
    expect(clearPending).not.toHaveBeenCalled();
  });

  it("생성 중 다른 화면으로 나가도 작업을 취소하지 않는다", async () => {
    render(<MissionLoading jobId="job-1" />);
    fireEvent.click(screen.getByRole("button", { name: "다른 화면 둘러보기" }));
    expect(push).toHaveBeenCalledWith("/mission");
    expect(clearPending).not.toHaveBeenCalled();
  });

  it("만료된 응답은 결과로 이동하지 않고 작업을 정리한다", async () => {
    fetchGenerationJobStatus.mockResolvedValue({
      ...PENDING_JOB,
      status: "SUCCEEDED",
      draftsAvailable: true,
      expiresAt: "2000-01-01T00:00:00Z",
    });
    render(<MissionLoading jobId="job-1" />);
    expect(await screen.findByText("미션 생성 결과가 만료됐어요.")).toBeTruthy();
    await waitFor(() => expect(clearPending).toHaveBeenCalledWith("job-1"));
    expect(replace).not.toHaveBeenCalled();
  });
});
