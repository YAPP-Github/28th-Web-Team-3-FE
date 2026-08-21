import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getPendingMissionGeneration = vi.fn();
const clearPendingMissionGeneration = vi.fn();
const fetchGenerationJobStatus = vi.fn();
const replace = vi.fn();
const startMissionGenerationWorkerPolling = vi.fn();
const pathname = vi.fn();

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

vi.mock("@/app/mission/new/utils/mission-generation-polling", () => ({
  getPollingIntervalMillis: () => 2_000,
  startMissionGenerationWorkerPolling: (args: unknown) => startMissionGenerationWorkerPolling(args),
  supportsMissionGenerationWorker: () => true,
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
  return render(<RecoveryWithClient client={client} />);
}

describe("PendingMissionGenerationRecovery", () => {
  beforeEach(() => {
    pathname.mockReturnValue("/mission");
    getPendingMissionGeneration.mockResolvedValue(PENDING_JOB);
    startMissionGenerationWorkerPolling.mockResolvedValue(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("다른 화면으로 복귀하면 로딩 화면으로 이동하지 않고 백그라운드 폴링을 시작한다", async () => {
    renderRecovery();

    await vi.waitFor(() => expect(startMissionGenerationWorkerPolling).toHaveBeenCalled());

    expect(replace).not.toHaveBeenCalled();
  });

  it("백그라운드 폴링이 완료되면 결과 확인 모달을 띄운다", async () => {
    startMissionGenerationWorkerPolling.mockImplementation(async ({ onMessage }) => {
      onMessage({ durationMs: 1, job: SUCCEEDED_JOB, type: "status" });
      return () => {};
    });

    renderRecovery();

    expect(await screen.findByText("미션이 생성됐어요.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "네" }));
    expect(replace).toHaveBeenCalledWith("/mission/new/result?jobId=job-1");
  });

  it("추천받기를 다시 누른 뒤 시작 화면에 오면 기존 작업의 로딩 화면으로 이동한다", async () => {
    pathname.mockReturnValue("/mission/new");

    renderRecovery();

    await vi.waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/mission/new/loading?jobId=job-1"),
    );

    expect(startMissionGenerationWorkerPolling).not.toHaveBeenCalled();
  });

  it("로딩 화면으로 전환하는 순간 완료돼도 결과 확인 모달을 띄우지 않는다", async () => {
    let notifyWorker:
      | ((message: { durationMs: number; job: typeof SUCCEEDED_JOB; type: "status" }) => void)
      | undefined;
    startMissionGenerationWorkerPolling.mockImplementation(async ({ onMessage }) => {
      notifyWorker = onMessage;
      return () => {};
    });
    const client = new QueryClient({
      defaultOptions: { queries: { gcTime: Number.POSITIVE_INFINITY, retry: false } },
    });
    const view = render(<RecoveryWithClient client={client} />);

    await vi.waitFor(() => expect(notifyWorker).toBeDefined());
    pathname.mockReturnValue("/mission/new/loading");
    await act(async () => {
      notifyWorker?.({ durationMs: 1, job: SUCCEEDED_JOB, type: "status" });
      view.rerender(<RecoveryWithClient client={client} />);
    });

    expect(screen.queryByText("미션이 생성됐어요.")).toBeNull();
  });

  it("결과 모달이 열린 뒤 로딩 화면으로 전환하면 모달을 닫는다", async () => {
    startMissionGenerationWorkerPolling.mockImplementation(async ({ onMessage }) => {
      onMessage({ durationMs: 1, job: SUCCEEDED_JOB, type: "status" });
      return () => {};
    });
    const client = new QueryClient({
      defaultOptions: { queries: { gcTime: Number.POSITIVE_INFINITY, retry: false } },
    });
    const view = render(<RecoveryWithClient client={client} />);

    expect(await screen.findByText("미션이 생성됐어요.")).toBeTruthy();
    pathname.mockReturnValue("/mission/new/loading");
    view.rerender(<RecoveryWithClient client={client} />);

    await vi.waitFor(() => expect(screen.queryByText("미션이 생성됐어요.")).toBeNull());
  });

  it("앱 화면이 다시 보이면 저장된 작업을 다시 확인한다", async () => {
    renderRecovery();

    await vi.waitFor(() => expect(getPendingMissionGeneration).toHaveBeenCalledTimes(1));
    document.dispatchEvent(new Event("visibilitychange"));

    await vi.waitFor(() => expect(getPendingMissionGeneration).toHaveBeenCalledTimes(2));
  });

  it("서비스 워커가 시작되면 초기 폴백 타이머가 Query 폴링을 켜지 않는다", async () => {
    let notifyWorker:
      | ((message: {
          durationMs: number;
          job: typeof PENDING_GENERATION_JOB;
          type: "status";
        }) => void)
      | undefined;
    startMissionGenerationWorkerPolling.mockImplementation(async ({ onMessage }) => {
      notifyWorker = onMessage;
      return () => {};
    });

    renderRecovery();

    await vi.waitFor(() => expect(notifyWorker).toBeDefined());
    vi.useFakeTimers();

    for (let index = 0; index < 3; index += 1) {
      notifyWorker?.({ durationMs: 1, job: PENDING_GENERATION_JOB, type: "status" });
      await vi.advanceTimersByTimeAsync(3_000);
    }

    expect(fetchGenerationJobStatus).not.toHaveBeenCalled();
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
});
