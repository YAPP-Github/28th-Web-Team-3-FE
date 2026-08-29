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

  /** 결과가 없을 때 아무것도 안 그리면 목록이 사라진 화면이 된다 — 없다고 말해야 한다. */
  it("고른 카테고리에 팁이 없으면 없다고 알린다", async () => {
    vi.mocked(fetchAllSavingTips).mockResolvedValue([]);

    render(<SavingTipList />);

    expect(await screen.findByText("해당하는 절약 팁이 없어요.")).toBeInTheDocument();
  });

  /**
   * 카테고리를 바꾸면 캐시 키가 통째로 바뀐다. 직전 결과를 유지하지 않으면 그 사이 목록이
   * 로딩 문구로 갈아엎였다가 새로 채워져 깜빡인다.
   */
  it("카테고리를 바꿔도 새 목록이 오기 전까지 이전 목록을 유지한다", async () => {
    vi.mocked(fetchAllSavingTips)
      .mockResolvedValueOnce(TIPS)
      .mockImplementationOnce(() => new Promise(() => {}));
    render(<SavingTipList />);
    await screen.findByText("집밥 레시피 활용팁");

    fireEvent.click(screen.getByRole("button", { name: "생활" }));

    expect(screen.getByText("집밥 레시피 활용팁")).toBeInTheDocument();
    expect(screen.queryByText("불러오는 중이에요.")).not.toBeInTheDocument();
  });
});
