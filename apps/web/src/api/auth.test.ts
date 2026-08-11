import { describe, expect, it, vi } from "vitest";

vi.mock("@/api/client", () => ({
  http: { delete: vi.fn(), get: vi.fn() },
}));

import { http } from "@/api/client";
import { getCurrentUser, withdrawGuest } from "./auth";

describe("auth API", () => {
  it("현재 사용자와 온보딩 완료 여부를 조회한다", () => {
    getCurrentUser();

    expect(http.get).toHaveBeenCalledWith(
      "auth/me",
      expect.objectContaining({ response: expect.anything() }),
    );
  });

  it("게스트 탈퇴를 요청한다", () => {
    withdrawGuest();

    expect(http.delete).toHaveBeenCalledWith("auth/guest");
  });
});
