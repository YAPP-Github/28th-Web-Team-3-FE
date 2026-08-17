import {
  manualMissionCreateRequestSchema,
  missionHistoriesResponseSchema,
  missionProgressSchema,
  missionSchema,
} from "@repo/schema/mission";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/client", () => ({
  http: { delete: vi.fn(), get: vi.fn(), patch: vi.fn(), post: vi.fn() },
}));

import { http } from "@/api/client";
import { createManualMission, fetchMissionHistories, fetchMissionProgress } from "./mission";

describe("mission API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("수동 미션 요청과 응답 계약을 함께 검증한다", async () => {
    const body = { category: "MEAL" as const, text: "저녁은 집밥으로 해결하기" };
    const mission = {
      id: "manual-1",
      source: "MANUAL" as const,
      category: "MEAL" as const,
      title: body.text,
      status: "ACTIVE" as const,
      weekEndsAt: "2099-01-01T00:00:00Z",
    };
    vi.mocked(http.post).mockReturnValue(Promise.resolve(mission) as never);

    await expect(createManualMission(body)).resolves.toEqual(mission);

    expect(http.post).toHaveBeenCalledWith(
      "missions/manual",
      expect.objectContaining({
        body,
        request: manualMissionCreateRequestSchema,
        response: missionSchema,
      }),
    );
  });

  it("현재 주 미션 진행률을 응답 계약으로 검증한다", async () => {
    const progress = {
      completedCount: 1,
      progressPercent: 25,
      totalCount: 4,
      weekStartDate: "2026-08-10",
    };
    vi.mocked(http.get).mockReturnValue(Promise.resolve(progress) as never);

    await expect(fetchMissionProgress()).resolves.toEqual(progress);
    expect(http.get).toHaveBeenCalledWith("missions/progress", {
      response: missionProgressSchema,
    });
  });

  it("선택한 달의 주차별 미션 완료 내역을 조회한다", async () => {
    const histories = [
      {
        completedCount: 1,
        isCurrentWeek: true,
        totalCount: 4,
        weekEndDate: "2026-08-23",
        weekOfMonth: 3,
        weekStartDate: "2026-08-17",
      },
    ];
    vi.mocked(http.get).mockReturnValue(Promise.resolve({ histories }) as never);

    await expect(fetchMissionHistories({ month: 8, year: 2026 })).resolves.toEqual(histories);
    expect(http.get).toHaveBeenCalledWith("missions/histories", {
      response: missionHistoriesResponseSchema,
      searchParams: { month: 8, year: 2026 },
    });
  });
});
