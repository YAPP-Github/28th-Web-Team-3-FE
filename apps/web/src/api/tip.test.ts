import type { Mock } from "vitest";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/api/client", () => ({ http: { delete: vi.fn(), get: vi.fn(), post: vi.fn() } }));

import { http } from "@/api/client";
import { bookmarkSavingTip, fetchSavingTips, unbookmarkSavingTip } from "./tip";

const httpGet = http.get as unknown as Mock;
const httpPost = http.post as unknown as Mock;
const httpDelete = http.delete as unknown as Mock;

describe("saving tip API", () => {
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
});
