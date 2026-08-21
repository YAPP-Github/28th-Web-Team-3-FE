import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@/lib/test/react";

const bookmarkTip = vi.fn();
const fetchTips = vi.fn();
const unbookmarkTip = vi.fn();

vi.mock("@repo/bridge", () => ({ isNativeApp: () => false }));
vi.mock("@/lib/open-external", () => ({ openExternalLink: vi.fn() }));
vi.mock("@/api/tip", () => ({
  bookmarkTip: (id: number) => bookmarkTip(id),
  fetchTips: () => fetchTips(),
  unbookmarkTip: (id: number) => unbookmarkTip(id),
}));

import { SavingTipList } from "./saving-tip-list";

describe("SavingTipList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchTips.mockResolvedValue([
      { id: 101, title: "집밥 레시피 활용팁", category: "식비", bookmarked: false },
      { id: 102, title: "밀프렙 식단관리팁", category: "식비", bookmarked: false },
    ]);
    bookmarkTip.mockResolvedValue(undefined);
    unbookmarkTip.mockResolvedValue(undefined);
  });

  it("팁 북마크 API로 별 저장을 요청한다", async () => {
    render(<SavingTipList />);

    const star = await screen.findByRole("button", { name: "집밥 레시피 활용팁 저장" });
    await waitFor(() => expect(star).toHaveAttribute("aria-busy", "false"));
    fireEvent.click(star);

    expect(star).toHaveAttribute("aria-pressed", "true");
    await waitFor(() => expect(bookmarkTip).toHaveBeenCalledWith(101));
  });

  it("저장됨 화면에서는 API가 저장됨으로 준 팁만 보여준다", async () => {
    fetchTips.mockResolvedValue([
      { id: 101, title: "집밥 레시피 활용팁", category: "식비", bookmarked: false },
      { id: 102, title: "밀프렙 식단관리팁", category: "식비", bookmarked: true },
    ]);

    render(<SavingTipList savedOnly />);

    expect(await screen.findByText("밀프렙 식단관리팁")).toBeInTheDocument();
    expect(screen.queryByText("집밥 레시피 활용팁")).not.toBeInTheDocument();
  });

  it("북마크 요청이 끝날 때까지 같은 팁을 다시 토글하지 않는다", async () => {
    let completeSave: (() => void) | undefined;
    bookmarkTip.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          completeSave = resolve;
        }),
    );
    render(<SavingTipList />);

    const star = await screen.findByRole("button", { name: "집밥 레시피 활용팁 저장" });
    await waitFor(() => expect(star).toHaveAttribute("aria-busy", "false"));
    fireEvent.click(star);
    fireEvent.click(star);

    await waitFor(() => expect(bookmarkTip).toHaveBeenCalledTimes(1));
    completeSave?.();
    await waitFor(() => expect(star).toHaveAttribute("aria-busy", "false"));
  });
});
