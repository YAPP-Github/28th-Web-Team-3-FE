import type { ResidentialArea } from "@repo/schema/onboarding-api";

const ADDRESS_CONFIRMATION_STORAGE_KEY_PREFIX = "onboarding:address-confirmed:";

export function isAddressConfirmed(address: ResidentialArea | null, userId?: number) {
  if (!address) return false;
  if (address !== "SEOUL") return true;
  if (userId === undefined) return false;

  try {
    return localStorage.getItem(`${ADDRESS_CONFIRMATION_STORAGE_KEY_PREFIX}${userId}`) === "true";
  } catch {
    return false;
  }
}

export function persistAddressConfirmation(userId: number) {
  try {
    localStorage.setItem(`${ADDRESS_CONFIRMATION_STORAGE_KEY_PREFIX}${userId}`, "true");
  } catch {
    // 저장소를 쓸 수 없으면 현재 폼 상태로 진행하고, 재진입 시 다시 선택하게 한다.
  }
}
