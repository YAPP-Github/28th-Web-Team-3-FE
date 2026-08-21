import * as SecureStore from "expo-secure-store";

const SAVED_SAVING_TIP_IDS_KEY = "saved_saving_tip_ids";
let pendingWrite: Promise<void> = Promise.resolve();

async function readSavedSavingTipIds(): Promise<string[]> {
  const stored = await SecureStore.getItemAsync(SAVED_SAVING_TIP_IDS_KEY);
  if (!stored) return [];
  try {
    const ids = JSON.parse(stored);
    if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string")) return [];
    return [...new Set(ids)];
  } catch {
    return [];
  }
}

export async function getSavedSavingTipIds(): Promise<string[]> {
  await pendingWrite;
  return readSavedSavingTipIds();
}

async function setSavedSavingTipIds(ids: readonly string[]): Promise<void> {
  await SecureStore.setItemAsync(SAVED_SAVING_TIP_IDS_KEY, JSON.stringify(ids));
}

function enqueueWrite(task: () => Promise<void>): Promise<void> {
  const write = pendingWrite.then(task, task);
  pendingWrite = write.catch(() => {});
  return write;
}

export function saveSavingTip(id: string): Promise<void> {
  return enqueueWrite(async () => {
    const savedIds = await readSavedSavingTipIds();
    if (savedIds.includes(id)) return;
    await setSavedSavingTipIds([...savedIds, id]);
  });
}

export function removeSavingTip(id: string): Promise<void> {
  return enqueueWrite(async () => {
    const savedIds = await readSavedSavingTipIds();
    await setSavedSavingTipIds(savedIds.filter((savedId) => savedId !== id));
  });
}
