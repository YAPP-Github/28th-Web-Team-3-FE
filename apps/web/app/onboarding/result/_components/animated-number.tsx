"use client";

import { cn } from "@repo/ui";
import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  className?: string;
  format?: (value: number) => string;
  value: number;
}

const defaultFormat = (value: number) => String(value);
const ANIMATION_DURATION_MS = 240;

function easeOutCubic(progress: number) {
  return 1 - (1 - progress) ** 3;
}

/** 숫자가 바뀌면 현재 표시값부터 새 값까지 부드럽게 보간한다. */
export function AnimatedNumber({ className, format = defaultFormat, value }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const displayValueRef = useRef(value);

  useEffect(
    function animateDisplayedNumber() {
      const startValue = displayValueRef.current;
      if (startValue === value) return;

      if (
        typeof window.requestAnimationFrame !== "function" ||
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
      ) {
        displayValueRef.current = value;
        setDisplayValue(value);
        return;
      }

      let animationFrameId = 0;
      let startedAt: number | undefined;

      function updateDisplayedNumber(timestamp: number) {
        startedAt ??= timestamp;
        const progress = Math.min((timestamp - startedAt) / ANIMATION_DURATION_MS, 1);
        const nextValue = Math.round(startValue + (value - startValue) * easeOutCubic(progress));

        if (nextValue !== displayValueRef.current) {
          displayValueRef.current = nextValue;
          setDisplayValue(nextValue);
        }

        if (progress < 1) {
          animationFrameId = window.requestAnimationFrame(updateDisplayedNumber);
        }
      }

      animationFrameId = window.requestAnimationFrame(updateDisplayedNumber);
      return () => window.cancelAnimationFrame(animationFrameId);
    },
    [value],
  );

  return (
    <output aria-label={format(value)} aria-live="off" className={cn("tabular-nums", className)}>
      <span aria-hidden="true">{format(displayValue)}</span>
    </output>
  );
}
