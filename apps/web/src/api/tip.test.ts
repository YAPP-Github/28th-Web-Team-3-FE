import type { TipSummary } from "@repo/schema/tip";
import { describe, expect, it, type Mock, vi } from "vitest";

vi.mock("@/api/client", () => ({ http: { delete: vi.fn(), get: vi.fn(), post: vi.fn() } }));

import { http } from "@/api/client";
import { bookmarkTip, fetchTips, unbookmarkTip } from "./tip";

const httpDelete = http.delete as unknown as Mock;
const httpGet = http.get as unknown as Mock;
const httpPost = http.post as unknown as Mock;

describe("tip API", () => {
  it("절약 팁 전체와 저장 상태를 조회한다", () => {
    httpGet.mockResolvedValue([] satisfies readonly TipSummary[]);

    fetchTips();

    expect(httpGet).toHaveBeenCalledWith(
      "tips",
      expect.objectContaining({ searchParams: { page: 0, size: 100 } }),
    );
  });

  it("팁 ID로 저장과 저장 취소를 요청한다", () => {
    bookmarkTip(42);
    unbookmarkTip(42);

    expect(httpPost).toHaveBeenCalledWith("tips/42/bookmark");
    expect(httpDelete).toHaveBeenCalledWith("tips/42/bookmark");
  });
});
