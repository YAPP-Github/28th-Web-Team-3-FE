import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const clearPendingMissionGeneration = vi.fn();
const fetchGenerationJobStatus = vi.fn();
const getPendingMissionGeneration = vi.fn();
const pathname = vi.fn();
const replace = vi.fn();

vi.mock("@repo/bridge", () => ({
  bridge: {
    clearPendingMissionGeneration: () => clearPendingMissionGeneration(),
    getPendingMissionGeneration: () => getPendingMissionGeneration(),
  },
  isNativeApp: () => true,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => pathname(),
  useRouter: () => ({ replace }),
}));

vi.mock("@/api/mission-generation", () => ({
  fetchGenerationJobStatus: () => fetchGenerationJobStatus(),
}));

import { PendingMissionGenerationRecovery } from "./pending-mission-generation-recovery";

const PENDING_JOB = {
  createdAt: Date.now(),
  expiresAt: "2099-01-01T00:00:00.000Z",
  jobId: "job-1",
};

const SUCCEEDED_JOB = {
  confirmed: false,
  draftsAvailable: true,
  expiresAt: null,
  failureCode: null,
  generationSource: null,
  jobId: "job-1",
  pollingIntervalMillis: 2_000,
  status: "SUCCEEDED" as const,
};

const PENDING_GENERATION_JOB = {
  ...SUCCEEDED_JOB,
  draftsAvailable: false,
  status: "PENDING" as const,
};

function RecoveryWithClient({ client }: { client: QueryClient }) {
  return (
    <QueryClientProvider client={client}>
      <PendingMissionGenerationRecovery />
    </QueryClientProvider>
  );
}

function renderRecovery() {
  const client = new QueryClient({
    defaultOptions: { queries: { gcTime: Number.POSITIVE_INFINITY, retry: false } },
  });
  return { client, ...render(<RecoveryWithClient client={client} />) };
}

describe("PendingMissionGenerationRecovery", () => {
  beforeEach(() => {
    pathname.mockReturnValue("/mission");
    getPendingMissionGeneration.mockResolvedValue(PENDING_JOB);
    fetchGenerationJobStatus.mockResolvedValue(PENDING_GENERATION_JOB);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("다른 화면으로 복귀하면 API 폴링으로 진행 중인 작업을 확인한다", async () => {
    renderRecovery();

    await vi.waitFor(() => expect(fetchGenerationJobStatus).toHaveBeenCalled());
    expect(replace).not.toHaveBeenCalled();
  });

  it("API가 완료 상태를 반환하면 결과 확인 모달을 띄운다", async () => {
    fetchGenerationJobStatus.mockResolvedValue(SUCCEEDED_JOB);
    renderRecovery();

    expect(await screen.findByText("미션이 생성됐어요.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "네" }));
    expect(replace).toHaveBeenCalledWith("/mission/new/result?jobId=job-1");
  });

  it("추천받기 시작 화면에서는 기존 작업의 로딩 화면으로 보낸다", async () => {
    pathname.mockReturnValue("/mission/new");
    renderRecovery();

    await vi.waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/mission/new/loading?jobId=job-1"),
    );
    expect(fetchGenerationJobStatus).not.toHaveBeenCalled();
  });

  it("결과 화면에 도착한 작업은 미션 화면으로 돌아가도 모달을 다시 띄우지 않는다", async () => {
    pathname.mockReturnValue("/mission/new/result");
    const { client, rerender } = renderRecovery();

    await vi.waitFor(() => expect(getPendingMissionGeneration).toHaveBeenCalled());
    fetchGenerationJobStatus.mockResolvedValue(SUCCEEDED_JOB);
    pathname.mockReturnValue("/mission");
    rerender(<RecoveryWithClient client={client} />);

    await vi.waitFor(() => expect(getPendingMissionGeneration).toHaveBeenCalledTimes(2));
    expect(screen.queryByText("미션이 생성됐어요.")).toBeNull();
  });

  it("네이티브 앱 복귀 신호를 받으면 작업과 생성 상태를 즉시 다시 확인한다", async () => {
    renderRecovery();

    await vi.waitFor(() => expect(fetchGenerationJobStatus).toHaveBeenCalled());
    const pendingJobRequestsBeforeResume = getPendingMissionGeneration.mock.calls.length;
    const statusRequestsBeforeResume = fetchGenerationJobStatus.mock.calls.length;
    window.dispatchEvent(new Event("akkimo:app-active"));

    await vi.waitFor(() =>
      expect(getPendingMissionGeneration.mock.calls.length).toBeGreaterThan(
        pendingJobRequestsBeforeResume,
      ),
    );
    await vi.waitFor(() =>
      expect(fetchGenerationJobStatus.mock.calls.length).toBeGreaterThan(
        statusRequestsBeforeResume,
      ),
    );
  });

  it("만료된 작업은 안전하게 지운다", async () => {
    getPendingMissionGeneration.mockResolvedValue({
      ...PENDING_JOB,
      expiresAt: "2000-01-01T00:00:00.000Z",
    });
    renderRecovery();

    await vi.waitFor(() => expect(clearPendingMissionGeneration).toHaveBeenCalled());
    expect(replace).not.toHaveBeenCalled();
  });

  it("구 버전 네이티브 브릿지에 복구 메서드가 없어도 전역 오류를 내지 않는다", async () => {
    getPendingMissionGeneration.mockRejectedValue(new Error("Method is not defined"));
    renderRecovery();

    await vi.waitFor(() => expect(getPendingMissionGeneration).toHaveBeenCalled());
    expect(replace).not.toHaveBeenCalled();
  });
});
