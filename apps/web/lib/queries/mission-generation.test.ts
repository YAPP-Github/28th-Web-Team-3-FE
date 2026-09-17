import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { afterEach, expect, it, vi } from "vitest";
import { generationJobStatusOptions } from "./mission-generation";

const fetchStatus = vi.fn();
vi.mock("@/api/mission-generation", () => ({
  fetchGenerationJobStatus: (id: string) => fetchStatus(id),
}));

const RUNNING_JOB = {
  jobId: "job-1",
  status: "RUNNING" as const,
  draftsAvailable: false,
  confirmed: false,
  failureCode: null,
  generationSource: null,
  expiresAt: null,
  pollingIntervalMillis: 100,
};

afterEach(() => {
  vi.useRealTimers();
  vi.resetAllMocks();
});

it("조회 오류 후 반복 요청을 멈추고 수동 조회 성공 시 폴링을 재개한다", async () => {
  vi.useFakeTimers();
  fetchStatus.mockRejectedValueOnce(new Error("offline")).mockResolvedValue(RUNNING_JOB);
  const client = new QueryClient();
  const observer = new QueryObserver(client, generationJobStatusOptions("job-1"));
  const unsubscribe = observer.subscribe(() => {});
  try {
    await vi.advanceTimersByTimeAsync(10_000);
    expect(fetchStatus).toHaveBeenCalledTimes(1);
    expect(observer.getCurrentResult().isError).toBe(true);
    await observer.refetch();
    await vi.advanceTimersByTimeAsync(100);
    expect(fetchStatus).toHaveBeenCalledTimes(3);
    expect(observer.getCurrentResult().data?.status).toBe("RUNNING");
  } finally {
    unsubscribe();
    client.clear();
  }
});

it("폴링 중 저장된 만료 시각에 도달하면 추가 HTTP 요청 없이 중단한다", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-15T00:00:00Z"));
  fetchStatus.mockResolvedValue({ ...RUNNING_JOB, expiresAt: "2026-09-15T00:00:00.100Z" });
  const client = new QueryClient();
  const observer = new QueryObserver(client, generationJobStatusOptions("job-1"));
  const unsubscribe = observer.subscribe(() => {});
  try {
    await vi.advanceTimersByTimeAsync(1_000);
    expect(fetchStatus).toHaveBeenCalledTimes(1);
    expect(observer.getCurrentResult().error?.name).toBe("MissionGenerationExpiredError");
  } finally {
    unsubscribe();
    client.clear();
  }
});

it.each(["FAILED", "SUCCEEDED"] as const)("%s 작업은 주기 조회를 끝낸다", async (status) => {
  vi.useFakeTimers();
  fetchStatus.mockResolvedValue({
    ...RUNNING_JOB,
    status,
    draftsAvailable: status === "SUCCEEDED",
  });
  const client = new QueryClient();
  const observer = new QueryObserver(client, generationJobStatusOptions("job-1"));
  const unsubscribe = observer.subscribe(() => {});
  try {
    await vi.advanceTimersByTimeAsync(1_000);
    expect(fetchStatus).toHaveBeenCalledTimes(1);
    expect(observer.getCurrentResult().data?.status).toBe(status);
  } finally {
    unsubscribe();
    client.clear();
  }
});
