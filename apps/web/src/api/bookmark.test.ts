import type { SavedContent } from "@repo/schema/bookmark";
import { describe, expect, it, type Mock, vi } from "vitest";

vi.mock("@/api/client", () => ({ http: { get: vi.fn() } }));

import { http } from "@/api/client";
import { fetchSavedPolicies } from "./bookmark";

// `http.get`은 response 스키마 유무로 갈리는 오버로드라 `vi.mocked`가 void 쪽을 잡는다.
const httpGet = http.get as unknown as Mock;

const SAVED: SavedContent[] = [
  { contentType: "POLICY", id: 1, title: "혜택", category: "주거", description: null },
  { contentType: "TIP", id: 2, title: "팁", category: null, description: null },
];

describe("bookmark API", () => {
  it("저장한 혜택만 요청한다", () => {
    httpGet.mockResolvedValue([]);

    fetchSavedPolicies();

    expect(httpGet).toHaveBeenCalledWith(
      "bookmarks",
      expect.objectContaining({ searchParams: { type: "POLICY" } }),
    );
  });

  // 팁이 섞여 오면 혜택 카드로 그려지고 별이 정책 북마크 경로로 나간다.
  it("팁이 섞여 와도 걸러낸다", async () => {
    httpGet.mockResolvedValue(SAVED);

    expect(await fetchSavedPolicies()).toEqual([SAVED[0]]);
  });
});
