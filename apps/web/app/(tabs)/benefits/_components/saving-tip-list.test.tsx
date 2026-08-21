import type { SavingTipSummary } from "@repo/schema/tip";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { bookmarkSavingTip, fetchAllSavingTips, unbookmarkSavingTip } from "@/api/tip";
import { fireEvent, render, screen, waitFor } from "@/lib/test/react";
import { SavingTipList } from "./saving-tip-list";

vi.mock("@/api/tip", () => ({
  bookmarkSavingTip: vi.fn(),
  fetchAllSavingTips: vi.fn(),
  fetchSavingTips: vi.fn(),
  unbookmarkSavingTip: vi.fn(),
}));

const TIPS: SavingTipSummary[] = [
  {
    bookmarked: false,
    category: "식비",
    description: "배달 메뉴 대신 집에서 직접 만드는 레시피 찾아보기",
    id: 1,
    sourceUrl: "https://www.youtube.com/watch?v=nZw2A76aZaw",
    subcategory: "배달음식",
    title: "집밥 레시피 활용팁",
  },
  {
    bookmarked: true,
    category: "생활",
    description: "당근마켓서 중고구매하고 안 쓰는 옷은 판매하기",
    id: 2,
    sourceUrl: "https://example.com/tip",
    subcategory: "의류",
    title: "당근마켓 중고활용팁",
  },
];

describe("SavingTipList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchAllSavingTips).mockResolvedValue(TIPS);
    vi.mocked(bookmarkSavingTip).mockResolvedValue(undefined);
    vi.mocked(unbookmarkSavingTip).mockResolvedValue(undefined);
  });

  it("서버에서 받은 팁과 원문 링크를 그린다", async () => {
    render(<SavingTipList />);

    expect(await screen.findByText("집밥 레시피 활용팁")).toBeInTheDocument();
    expect(fetchAllSavingTips).toHaveBeenCalledWith(null, 100);
    expect(screen.getByRole("link", { name: /집밥 레시피 활용팁/ })).toHaveAttribute(
      "href",
      "https://www.youtube.com/watch?v=nZw2A76aZaw",
    );
  });

  it("카테고리를 누르면 해당 카테고리 API를 다시 조회한다", async () => {
    render(<SavingTipList />);
    await screen.findByText("집밥 레시피 활용팁");

    fireEvent.click(screen.getByRole("button", { name: "생활" }));

    await waitFor(() => expect(fetchAllSavingTips).toHaveBeenCalledWith("생활", 100));
  });

  it("저장한 팁만 저장 목록에 남긴다", async () => {
    render(<SavingTipList savedOnly />);

    expect(await screen.findByText("당근마켓 중고활용팁")).toBeInTheDocument();
    expect(screen.queryByText("집밥 레시피 활용팁")).not.toBeInTheDocument();
  });

  it("별을 누르면 서버 북마크 API를 호출한다", async () => {
    render(<SavingTipList />);
    await screen.findByText("집밥 레시피 활용팁");

    fireEvent.click(screen.getByRole("button", { name: "집밥 레시피 활용팁 저장" }));

    await waitFor(() => expect(bookmarkSavingTip).toHaveBeenCalledWith(1));
  });
});
