import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@/lib/test/react";
import { useDebounce } from "./use-debounce";

describe("useDebounce", () => {
  afterEach(() => vi.useRealTimers());

  it("연속 변경이 멈춘 뒤 마지막 값을 반영한다", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 100 },
    });

    rerender({ value: 110 });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: 120 });
    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe(100);

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(120);
  });
});
