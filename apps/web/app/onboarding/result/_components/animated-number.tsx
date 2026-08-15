"use client";

import { cn } from "@repo/ui";
import { useLayoutEffect, useRef } from "react";

interface AnimatedNumberProps {
  className?: string;
  format?: (value: number) => string;
  value: number;
}

const defaultFormat = (value: number) => String(value);

/** 숫자가 바뀔 때 새 값을 짧게 띄워 보여준다. reduced-motion에서는 즉시 교체한다. */
export function AnimatedNumber({ className, format = defaultFormat, value }: AnimatedNumberProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const previousValueRef = useRef(value);

  useLayoutEffect(() => {
    const previousValue = previousValueRef.current;
    previousValueRef.current = value;
    if (previousValue === value) return;

    const element = elementRef.current;
    if (
      !element ||
      typeof element.animate !== "function" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const offset = value > previousValue ? 4 : -4;
    const animation = element.animate(
      [
        { opacity: 0.35, transform: `translateY(${offset}px)` },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 180, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    );
    return () => animation.cancel();
  }, [value]);

  return (
    <span className={cn("inline-block tabular-nums", className)} ref={elementRef}>
      {format(value)}
    </span>
  );
}
