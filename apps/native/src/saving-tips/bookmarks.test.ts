import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = vi.hoisted(() => new Map<string, string>());

vi.mock("expo-secure-store", () => ({
  getItemAsync: vi.fn(async (key: string) => storage.get(key) ?? null),
  setItemAsync: vi.fn(async (key: string, value: string) => {
    storage.set(key, value);
  }),
}));

import * as SecureStore from "expo-secure-store";
import { getSavedSavingTipIds, removeSavingTip, saveSavingTip } from "./bookmarks";

describe("saving tip bookmarks", () => {
  beforeEach(() => {
    storage.clear();
    vi.clearAllMocks();
  });

  it("팁 ID를 중복 없이 SecureStore에 저장한다", async () => {
    await saveSavingTip("cafe-gifticon");
    await saveSavingTip("cafe-gifticon");

    await expect(getSavedSavingTipIds()).resolves.toEqual(["cafe-gifticon"]);
    expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(1);
  });

  it("동시에 저장해도 모든 팁 ID를 남긴다", async () => {
    await Promise.all([saveSavingTip("cafe-gifticon"), saveSavingTip("meal-prep")]);

    await expect(getSavedSavingTipIds()).resolves.toEqual(["cafe-gifticon", "meal-prep"]);
  });

  it("저장한 팁을 제거한다", async () => {
    storage.set("saved_saving_tip_ids", JSON.stringify(["cafe-gifticon", "meal-prep"]));

    await removeSavingTip("cafe-gifticon");

    await expect(getSavedSavingTipIds()).resolves.toEqual(["meal-prep"]);
  });

  it("손상된 저장값은 빈 목록으로 처리한다", async () => {
    storage.set("saved_saving_tip_ids", "not-json");

    await expect(getSavedSavingTipIds()).resolves.toEqual([]);
  });
});
