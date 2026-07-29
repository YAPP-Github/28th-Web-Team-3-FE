/** 숫자 입력 정규화 — 금액·기간 입력 화면들이 같은 규칙을 쓴다. */

/** 숫자가 아닌 문자를 모두 지운다. 붙여넣기·IME 입력으로 들어온 기호를 거른다. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * 입력 단계에서 상한만 자른다. 빈 문자열은 그대로 둬야 지우는 도중 "0"이 되지 않는다.
 *
 * 하한은 여기서 막지 않는다 — 타이핑 도중 강제하면 `12`를 치려고 `1`을 눌렀을 때
 * 값이 튄다. 하한은 제출 시점에 검사한다.
 */
export function clampDigits(value: string, max: number): string {
  const digits = onlyDigits(value);
  if (digits === "") return "";
  return String(Math.min(Number(digits), max));
}
