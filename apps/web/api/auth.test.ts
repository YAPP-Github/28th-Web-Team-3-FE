import { describe, expect, it, vi } from "vitest";

vi.mock("@/api/client", () => ({
  http: { get: vi.fn() },
}));

import { http } from "@/api/client";
import { getCurrentUser } from "./auth";

describe("auth API", () => {
  it("현재 사용자와 온보딩 완료 여부를 조회한다", () => {
    getCurrentUser();

    expect(http.get).toHaveBeenCalledWith(
      "auth/me",
      expect.objectContaining({ response: expect.anything() }),
    );
  });
});
