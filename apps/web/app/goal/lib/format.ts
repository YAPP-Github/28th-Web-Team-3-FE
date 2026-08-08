/** D-day 정수를 "D-486" 형태로 포맷한다. 0 이하(당일·기한 경과)는 "D-DAY"로 clamp한다. */
export function formatDday(dday: number): string {
  return dday <= 0 ? "D-DAY" : `D-${dday}`;
}
