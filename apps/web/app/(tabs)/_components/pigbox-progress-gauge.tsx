import { cn } from "@repo/ui";
import type { AnimationItem } from "lottie-web";
import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

const PIG_TOP_PERCENT = 33;
const PIG_BOTTOM_PERCENT = 94;
const PIG_BLUE = [41 / 255, 188 / 255, 1, 1];
const BODY_LAYER_NAMES = new Set(["Vector 118", "Ellipse 3332", "Vector 98", "Vector 96"]);

interface LottieShape {
  c?: unknown;
  it?: LottieShape[];
  ty?: string;
}

interface LottieLayer {
  hd?: boolean;
  nm?: string;
  shapes?: LottieShape[];
}

interface PigboxAnimationData {
  fr: number;
  ip?: number;
  layers?: LottieLayer[];
  op: number;
  [key: string]: unknown;
}

function clampProgress(progress: number): number {
  return Math.min(100, Math.max(0, progress));
}

export function calculatePigboxFillTop(progress: number): number {
  const clampedProgress = clampProgress(progress);
  const fillTop =
    PIG_BOTTOM_PERCENT - ((PIG_BOTTOM_PERCENT - PIG_TOP_PERCENT) * clampedProgress) / 100;

  return Number(fillTop.toFixed(2));
}

function cloneAnimationData(data: PigboxAnimationData): PigboxAnimationData {
  return JSON.parse(JSON.stringify(data)) as PigboxAnimationData;
}

function visitShapes(shapes: LottieShape[] | undefined, visit: (shape: LottieShape) => void) {
  for (const shape of shapes ?? []) {
    visit(shape);
    visitShapes(shape.it, visit);
  }
}

function createAnimationVariants(source: PigboxAnimationData) {
  const base = cloneAnimationData(source);
  const water = cloneAnimationData(source);
  const details = cloneAnimationData(source);

  for (const layer of water.layers ?? []) {
    layer.hd = !BODY_LAYER_NAMES.has(layer.nm ?? "");
    if (layer.hd) continue;

    visitShapes(layer.shapes, (shape) => {
      if ((shape.ty === "fl" || shape.ty === "st") && shape.c) {
        shape.c = { a: 0, k: PIG_BLUE };
      }
    });
  }

  for (const layer of details.layers ?? []) {
    layer.hd = BODY_LAYER_NAMES.has(layer.nm ?? "");
  }

  return { base, details, water };
}

function renderAnimation(
  lottie: typeof import("lottie-web").default,
  container: HTMLDivElement,
  animationData: PigboxAnimationData,
): AnimationItem {
  return lottie.loadAnimation({
    animationData,
    autoplay: false,
    container,
    loop: true,
    renderer: "svg",
    rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
  });
}

interface PigboxProgressGaugeProps {
  className?: string;
  completedCount: number;
  progress: number;
}

export function PigboxProgressGauge({
  className,
  completedCount,
  progress,
}: PigboxProgressGaugeProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const waterRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const clampedProgress = clampProgress(progress);
  const previousCompletedCountRef = useRef(completedCount);
  const previousProgressRef = useRef(clampedProgress);
  const [isReady, setIsReady] = useState(false);
  const [isFillAnimating, setIsFillAnimating] = useState(false);
  const [displayedProgress, setDisplayedProgress] = useState(clampedProgress);
  const style = {
    "--pigbox-fill-top": `${calculatePigboxFillTop(displayedProgress)}%`,
  } as CSSProperties;

  useEffect(() => {
    if (!(baseRef.current && waterRef.current && detailsRef.current)) return;

    const baseContainer = baseRef.current;
    const waterContainer = waterRef.current;
    const detailsContainer = detailsRef.current;

    const abortController = new AbortController();
    let animations: AnimationItem[] = [];
    let removeFrameListener: (() => void) | undefined;

    async function setupAnimation() {
      try {
        const [{ default: lottie }, response] = await Promise.all([
          import("lottie-web"),
          fetch("/lottie/pigbox.json", { signal: abortController.signal }),
        ]);
        if (!response.ok) throw new Error(`Pigbox Lottie 요청 실패: ${response.status}`);

        const source = (await response.json()) as PigboxAnimationData;
        if (abortController.signal.aborted) return;

        const variants = createAnimationVariants(source);
        animations = [
          renderAnimation(lottie, baseContainer, variants.base),
          renderAnimation(lottie, waterContainer, variants.water),
          renderAnimation(lottie, detailsContainer, variants.details),
        ];
        setIsReady(true);

        const [baseAnimation, waterAnimation, detailsAnimation] = animations;
        if (!(baseAnimation && waterAnimation && detailsAnimation)) return;

        removeFrameListener = baseAnimation.addEventListener("enterFrame", ({ currentTime }) => {
          waterAnimation.goToAndStop(currentTime, true);
          detailsAnimation.goToAndStop(currentTime, true);
        });

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          for (const animation of animations) animation.goToAndStop(0, true);
        } else {
          baseAnimation.play();
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setIsReady(false);
        }
      }
    }

    void setupAnimation();

    return () => {
      abortController.abort();
      removeFrameListener?.();
      for (const animation of animations) animation.destroy();
    };
  }, []);

  useEffect(() => {
    const previousCompletedCount = previousCompletedCountRef.current;
    const previousProgress = previousProgressRef.current;
    previousCompletedCountRef.current = completedCount;
    previousProgressRef.current = clampedProgress;

    const shouldAnimate =
      completedCount > previousCompletedCount &&
      clampedProgress > previousProgress &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!shouldAnimate) {
      setIsFillAnimating(false);
      setDisplayedProgress(clampedProgress);
      return;
    }

    setIsFillAnimating(true);
    const animationFrame = requestAnimationFrame(() => {
      setDisplayedProgress(clampedProgress);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [clampedProgress, completedCount]);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none relative h-[130px] w-[117px] shrink-0 overflow-hidden",
        className,
      )}
      data-pigbox-progress={Math.round(clampedProgress)}
      style={style}
    >
      {isReady ? null : (
        <Image
          fill
          alt=""
          aria-hidden="true"
          className="object-contain"
          sizes="117px"
          src="/images/mission/pigbox-home.png"
        />
      )}
      <div ref={baseRef} aria-hidden="true" className="absolute inset-0 z-10" />
      <div
        ref={waterRef}
        aria-hidden="true"
        className={cn(
          "absolute inset-0 z-20",
          isFillAnimating
            ? "transition-[clip-path] duration-700 ease-out motion-reduce:transition-none"
            : "transition-none",
        )}
        data-pigbox-fill=""
        style={{ clipPath: "inset(var(--pigbox-fill-top) 0 6% 0)" }}
        onTransitionEnd={() => setIsFillAnimating(false)}
      />
      <div ref={detailsRef} aria-hidden="true" className="absolute inset-0 z-30" />
    </div>
  );
}
