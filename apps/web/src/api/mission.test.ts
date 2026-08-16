import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/client", () => ({
  http: { delete: vi.fn(), get: vi.fn(), patch: vi.fn(), post: vi.fn() },
}));

import { http } from "@/api/client";
import { createManualMission } from "./mission";

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
        request: expect.anything(),
        response: expect.anything(),
      }),
    );
  });
});
