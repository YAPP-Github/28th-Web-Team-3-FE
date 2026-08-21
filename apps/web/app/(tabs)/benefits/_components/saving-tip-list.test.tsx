import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@/lib/test/react";

const getSavedSavingTipIds = vi.fn();
const removeSavingTip = vi.fn();
const saveSavingTip = vi.fn();

vi.mock("@repo/bridge", () => ({ isNativeApp: () => false }));
vi.mock("@/lib/open-external", () => ({ openExternalLink: vi.fn() }));
vi.mock("@/app/(tabs)/benefits/utils/saving-tip-bookmarks", () => ({
  getSavedSavingTipIds: () => getSavedSavingTipIds(),
  removeSavingTip: (id: string) => removeSavingTip(id),
  saveSavingTip: (id: string) => saveSavingTip(id),
}));

import { SavingTipList } from "./saving-tip-list";

describe("SavingTipList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSavedSavingTipIds.mockResolvedValue([]);
    removeSavingTip.mockResolvedValue(true);
    saveSavingTip.mockResolvedValue(true);
  });

  it("정책 혜택처럼 별을 눌러 팁을 저장한다", async () => {
    render(<SavingTipList />);

    const star = await screen.findByRole("button", { name: "집밥 레시피 활용팁 저장" });
    await waitFor(() => expect(star).toHaveAttribute("aria-busy", "false"));
    fireEvent.click(star);

    expect(star).toHaveAttribute("aria-pressed", "true");
    await waitFor(() => expect(saveSavingTip).toHaveBeenCalledWith("home-cooking-recipe"));
  });

  it("저장됨 화면에서는 기기에 저장한 팁만 보여준다", async () => {
    getSavedSavingTipIds.mockResolvedValue(["meal-prep"]);

    render(<SavingTipList savedOnly />);

    expect(await screen.findByText("밀프렙 식단관리팁")).toBeInTheDocument();
    expect(screen.queryByText("집밥 레시피 활용팁")).not.toBeInTheDocument();
  });

  it("저장 요청이 끝날 때까지 같은 팁을 다시 토글하지 않는다", async () => {
    let completeSave: ((saved: boolean) => void) | undefined;
    saveSavingTip.mockImplementation(
      () =>
        new Promise<boolean>((resolve) => {
          completeSave = resolve;
        }),
    );
    render(<SavingTipList />);

    const star = await screen.findByRole("button", { name: "집밥 레시피 활용팁 저장" });
    await waitFor(() => expect(star).toHaveAttribute("aria-busy", "false"));
    fireEvent.click(star);
    fireEvent.click(star);

    expect(saveSavingTip).toHaveBeenCalledTimes(1);
    completeSave?.(true);
    await waitFor(() => expect(star).toHaveAttribute("aria-busy", "false"));
  });
});
