/**
 * 저장한 혜택 id — 기기 안에만 남는다. 서버 저장이 없어 앱을 지우거나 웹뷰 데이터를
 * 비우면 사라지고 기기 간에도 공유되지 않는다. 공개 정책 링크 북마크라 이 정도는
 * 감수하되, 나중에 서버 저장이 생기면 이 키를 읽어 옮겨야 한다.
 *
 * 키에 버전을 붙여 둔다 — 형식을 바꿀 때 예전 값을 그대로 읽어 깨지지 않게 한다.
 */
const STORAGE_KEY = "akkimo.saved-benefits.v1";

export const NO_SAVED_BENEFITS: ReadonlySet<string> = new Set();

/** 저장소를 못 읽는 상황(프라이빗 모드, 손상된 값)은 "저장 없음"으로 본다. */
export function readSavedBenefits(): ReadonlySet<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return NO_SAVED_BENEFITS;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return NO_SAVED_BENEFITS;
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return NO_SAVED_BENEFITS;
  }
}

/** 저장에 실패해도 화면은 계속 돌아야 한다 — 이번 세션의 표시는 호출부 상태로 유지된다. */
export function writeSavedBenefits(ids: ReadonlySet<string>): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // 저장소 용량 초과·접근 차단.
  }
}

/** 있으면 빼고 없으면 넣은 새 집합. 원본은 건드리지 않는다. */
export function toggleSavedBenefit(ids: ReadonlySet<string>, id: string): ReadonlySet<string> {
  const next = new Set(ids);
  if (!next.delete(id)) next.add(id);
  return next;
}
