export function calculateGoalTotalTargetManwon(
  totalSavedManwon: number,
  additionalTargetManwon: number,
) {
  return totalSavedManwon + additionalTargetManwon;
}

export function calculateGoalProgressPercent(totalSavedManwon: number, totalTargetManwon: number) {
  if (totalTargetManwon <= 0) return 0;
  return Math.min(100, Math.round((totalSavedManwon / totalTargetManwon) * 100));
}

export function calculateAdditionalTargetManwon(
  totalTargetManwon: number,
  totalSavedManwon: number,
) {
  return Math.max(1, totalTargetManwon - totalSavedManwon);
}
