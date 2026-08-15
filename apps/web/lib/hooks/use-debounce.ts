import { useEffect, useState } from "react";

/** 값 변경이 멈춘 뒤 지정 시간이 지나면 마지막 값을 반영한다. */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(
    function scheduleDebouncedValueUpdate() {
      const timerId = window.setTimeout(() => setDebouncedValue(value), delayMs);
      return () => window.clearTimeout(timerId);
    },
    [delayMs, value],
  );

  return debouncedValue;
}
