import { bridge, isNativeApp } from "@repo/bridge";

export async function getSavedSavingTipIds(): Promise<string[]> {
  if (!isNativeApp()) return [];
  return bridge.getSavedSavingTipIds().catch(() => []);
}

export async function saveSavingTip(id: string): Promise<boolean> {
  if (!isNativeApp()) return false;
  return bridge.saveSavingTip(id).then(
    () => true,
    () => false,
  );
}

export async function removeSavingTip(id: string): Promise<boolean> {
  if (!isNativeApp()) return false;
  return bridge.removeSavingTip(id).then(
    () => true,
    () => false,
  );
}
