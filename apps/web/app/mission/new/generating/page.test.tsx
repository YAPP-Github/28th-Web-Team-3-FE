import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchGenerationJobStatus = vi.fn();
const replaceMock = vi.fn();

vi.mock("@/api/mission-generation", () => ({
  requestGenerationJob: vi.fn(),
  fetchGenerationJobStatus: (...args: unknown[]) => fetchGenerationJobStatus(...args),
  fetchGenerationDrafts: vi.fn(),
  confirmGenerationJob: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: replaceMock, push: vi.fn() }) }));

import { MissionGenerating } from "@/app/mission/_components/mission-generating";

function renderWithClient() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MissionGenerating jobId="job-1" />
    </QueryClientProvider>,
  );
}

const PENDING_JOB = {
  jobId: "job-1",
  status: "PENDING",
  failureCode: null,
  generationSource: null,
  draftsAvailable: false,
  expiresAt: null,
  confirmed: false,
  pollingIntervalMillis: 2000,
};

describe("MissionGenerating", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("jobId로 5초 간격 상태를 반복 조회한다", async () => {
    fetchGenerationJobStatus.mockResolvedValue(PENDING_JOB);

    renderWithClient();

    await vi.waitFor(() => expect(fetchGenerationJobStatus).toHaveBeenCalledTimes(1));

    await vi.advanceTimersByTimeAsync(5000);
    await vi.waitFor(() => expect(fetchGenerationJobStatus).toHaveBeenCalledTimes(2));

    await vi.advanceTimersByTimeAsync(5000);
    await vi.waitFor(() => expect(fetchGenerationJobStatus).toHaveBeenCalledTimes(3));
  });

  it("폴링 중 일시적인 조회 실패를 생성 실패로 표시하지 않는다", async () => {
    // 5초마다 조회하므로 네트워크가 한 번 끊긴 것으로 "미션 생성에 실패했어요"를 띄우면
    // 사용자는 멀쩡히 진행 중인 생성을 포기한다.
    fetchGenerationJobStatus
      .mockResolvedValueOnce(PENDING_JOB)
      .mockRejectedValueOnce(new Error("network error"))
      .mockResolvedValue(PENDING_JOB);

    renderWithClient();

    await vi.waitFor(() => expect(screen.getByText(/맞춤 미션을 만들고 있어요/)).toBeTruthy());

    await vi.advanceTimersByTimeAsync(5000);
    await vi.waitFor(() => expect(fetchGenerationJobStatus).toHaveBeenCalledTimes(2));

    expect(screen.queryByText(/미션 생성에 실패했어요/)).toBeNull();
    expect(screen.getByText(/맞춤 미션을 만들고 있어요/)).toBeTruthy();
  });

  it("첫 조회부터 실패하면 생성 실패로 안내한다", async () => {
    fetchGenerationJobStatus.mockRejectedValue(new Error("network error"));

    renderWithClient();

    await vi.waitFor(() => expect(screen.getByText(/미션 생성에 실패했어요/)).toBeTruthy());
  });

  it("완료되면 폴링을 멈추고 결과 화면으로 이동한다", async () => {
    fetchGenerationJobStatus.mockResolvedValue({
      ...PENDING_JOB,
      status: "SUCCEEDED",
      draftsAvailable: true,
    });

    renderWithClient();

    await vi.waitFor(() =>
      expect(replaceMock).toHaveBeenCalledWith("/mission/new/result?jobId=job-1"),
    );

    const callsAfterSuccess = fetchGenerationJobStatus.mock.calls.length;
    await vi.advanceTimersByTimeAsync(10_000);
    expect(fetchGenerationJobStatus).toHaveBeenCalledTimes(callsAfterSuccess);
  });
});
