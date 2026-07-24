/** 만원 단위 정수를 "1,950만원" 형태로 포맷한다. */
export function formatManwon(manwon: number): string {
  return `${manwon.toLocaleString("ko-KR")}만원`;
}

/** D-day 정수를 "D-486" 형태로 포맷한다. */
export function formatDday(dday: number): string {
  return `D-${dday}`;
}
