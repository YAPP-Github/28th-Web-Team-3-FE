/**
 * 화면에 숫자를 내보내는 포맷터. 만원 표기가 화면마다 따로 구현돼 있어 한곳으로 모았다.
 *
 * `Intl.NumberFormat` 인스턴스는 생성 비용이 있어 모듈 수준에서 한 번만 만든다 —
 * 렌더마다 `toLocaleString`을 부르면 내부적으로 매번 새로 만들어진다.
 */
const numberFormatter = new Intl.NumberFormat("ko-KR");

/** 정수를 "1,950"처럼 천 단위로 끊는다. 단위는 붙이지 않는다. */
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** 만원 단위 정수를 "1,950만원" 형태로 포맷한다. */
export function formatManwon(manwon: number): string {
  return `${numberFormatter.format(manwon)}만원`;
}
