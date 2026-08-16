import type { Mission } from "@repo/schema/mission";
import { formatNumber } from "@/lib/format";

const DAY_MS = 1000 * 60 * 60 * 24;

/** 이번 주 마감(`weekEndsAt`)까지 남은 일수를 "D-7"/"D-DAY" 형태로 포맷한다. 미션이 없으면 기본값. */
export function formatWeekDday(weekEndsAt: string | undefined): string {
  if (!weekEndsAt) return "D-7";
  const days = Math.max(0, Math.ceil((new Date(weekEndsAt).getTime() - Date.now()) / DAY_MS));
  return days === 0 ? "D-DAY" : `D-${days}`;
}

/** 완료한 미션 수 — 완료 1건당 코인 1개로 표시한다. */
export function countCompletedMissions(missions: readonly Mission[]): number {
  return missions.filter((mission) => mission.status === "COMPLETED").length;
}

/** 이번 주 미션 진행률(%) — 완료/전체 개수 기준. */
export function calculateProgressPercent(missions: readonly Mission[]): number {
  if (missions.length === 0) return 0;
  return Math.round((countCompletedMissions(missions) / missions.length) * 100);
}

/** 완료 미션의 예상 절약액 합계. 예상액이 없는 직접 입력 미션은 0원으로 센다. */
export function sumCompletedSavingsWon(missions: readonly Mission[]): number {
  return missions.reduce(
    (total, mission) =>
      mission.status === "COMPLETED" ? total + (mission.estimatedSavingsWon ?? 0) : total,
    0,
  );
}

/** 원 단위 금액을 미션 요약 문구에 맞는 축약형으로 표시한다. */
export function formatSavedWon(won: number): string {
  if (won >= 10_000 && won % 10_000 === 0) return `${formatNumber(won / 10_000)}만원`;
  return `${formatNumber(won)}원`;
}
