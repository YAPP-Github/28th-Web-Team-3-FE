import type { Mock } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/api/client", () => ({ http: { delete: vi.fn(), get: vi.fn(), post: vi.fn() } }));

import { http } from "@/api/client";
import { bookmarkSavingTip, fetchAllSavingTips, fetchSavingTips, unbookmarkSavingTip } from "./tip";

const httpGet = http.get as unknown as Mock;
const httpPost = http.post as unknown as Mock;
const httpDelete = http.delete as unknown as Mock;

describe("saving tip API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("카테고리와 페이지를 포함해 팁 목록을 요청한다", () => {
    httpGet.mockResolvedValue([]);

    fetchSavingTips({ category: "식비", page: 0, size: 100 });

    expect(httpGet).toHaveBeenCalledWith(
      "tips",
      expect.objectContaining({ searchParams: { category: "식비", page: 0, size: 100 } }),
    );
  });

  it("팁 저장과 저장 취소 API를 호출한다", () => {
    bookmarkSavingTip(3);
    unbookmarkSavingTip(3);

    expect(httpPost).toHaveBeenCalledWith("tips/3/bookmark");
    expect(httpDelete).toHaveBeenCalledWith("tips/3/bookmark");
  });

  it("마지막 페이지까지 이어 받아 전체 팁을 모은다", async () => {
    httpGet.mockResolvedValueOnce([{ id: 1 }, { id: 2 }]).mockResolvedValueOnce([{ id: 3 }]);

    const tips = await fetchAllSavingTips(null, 2);

    expect(tips).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(httpGet).toHaveBeenNthCalledWith(
      2,
      "tips",
      expect.objectContaining({ searchParams: { page: 1, size: 2 } }),
    );
  });
});
