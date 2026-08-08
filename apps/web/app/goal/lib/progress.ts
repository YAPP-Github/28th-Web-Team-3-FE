export function calculateGoalTotalTargetManwon(
  _totalSavedManwon: number,
  targetAmountManwon: number,
) {
  return targetAmountManwon;
}

export function calculateGoalProgressPercent(totalSavedManwon: number, totalTargetManwon: number) {
  if (totalTargetManwon <= 0) return 0;
  return Math.min(100, Math.round((totalSavedManwon / totalTargetManwon) * 100));
}
