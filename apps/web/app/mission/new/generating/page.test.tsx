import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchGenerationJobStatus = vi.fn();
const replaceMock = vi.fn();

vi.mock("@/app/mission/_generation/api", () => ({
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
