import { cn } from "@repo/ui";
import type { AnimationItem } from "lottie-web";
import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

const PIG_TOP_PERCENT = 33;
const PIG_BOTTOM_PERCENT = 94;
const PIG_BLUE = [41 / 255, 188 / 255, 1, 1];
const BODY_LAYER_NAMES = new Set(["Vector 118", "Ellipse 3332", "Vector 98", "Vector 96"]);

/** 로티 캔버스 높이. 몸통이 움직인 px을 클립에 쓸 %로 바꿀 때 기준이 된다. */
const PIGBOX_CANVAS_HEIGHT = 130;

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
  loop: boolean,
): AnimationItem {
  return lottie.loadAnimation({
    animationData,
    autoplay: false,
    container,
    loop,
    renderer: "svg",
    rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
  });
}

interface PigboxProgressGaugeProps {
  /** 기본은 정지된 진행률 이미지이며, 반복 재생이 필요한 화면에서만 켠다. */
  animated?: boolean;
  className?: string;
  completedCount: number;
  /** 정지 모드에서 값이 증가할 때마다 저금통 애니메이션을 1회 재생한다. */
  playRequest?: number;
  progress: number;
}

export function PigboxProgressGauge({
  animated = false,
  className,
  completedCount,
  playRequest = 0,
  progress,
}: PigboxProgressGaugeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const waterRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const clampedProgress = clampProgress(progress);
  const previousCompletedCountRef = useRef(completedCount);
  const previousProgressRef = useRef(clampedProgress);
  const animationsRef = useRef<AnimationItem[]>([]);
  const clickStartFrameRef = useRef(0);
  const latestPlayRequestRef = useRef(playRequest);
  const lastPlayedRequestRef = useRef(0);
  const [isReady, setIsReady] = useState(false);
  const [isFillAnimating, setIsFillAnimating] = useState(false);
  const [displayedProgress, setDisplayedProgress] = useState(clampedProgress);
  const style = {
    "--pigbox-fill-top": `${calculatePigboxFillTop(displayedProgress)}%`,
    // 로티가 뜨기 전과 읽기 실패 시의 기본값. 보정 없이 지금까지와 같은 화면이 된다.
    "--pigbox-body-offset": "0%",
  } as CSSProperties;

  useEffect(() => {
    if (!(rootRef.current && baseRef.current && waterRef.current && detailsRef.current)) return;

    const rootContainer = rootRef.current;
    const baseContainer = baseRef.current;
    const waterContainer = waterRef.current;
    const detailsContainer = detailsRef.current;

    const abortController = new AbortController();
    let animations: AnimationItem[] = [];
    let removeCompleteListener: (() => void) | undefined;
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
        // 원본의 첫 1초는 정지에 가까워 탭 반응이 늦게 보인다. 클릭 재생만 그 구간을 건너뛴다.
        clickStartFrameRef.current = (source.ip ?? 0) + source.fr;
        animations = [
          renderAnimation(lottie, baseContainer, variants.base, animated),
          renderAnimation(lottie, waterContainer, variants.water, animated),
          renderAnimation(lottie, detailsContainer, variants.details, animated),
        ];
        animationsRef.current = animations;
        setIsReady(true);

        const [baseAnimation, waterAnimation, detailsAnimation] = animations;
        if (!(baseAnimation && waterAnimation && detailsAnimation)) return;

        // 매 프레임 도는 자리라 찾은 요소는 들고 있는다.
        let bodyLayer: SVGGElement | null = null;
        // 쉬는 위치(0프레임). 처음 한 번 잡고, 이후엔 여기서 얼마나 벗어났는지만 본다.
        let restTranslateY: number | null = null;

        /**
         * 물높이를 몸통이 움직인 만큼 같이 민다.
         *
         * 키프레임을 직접 보간하지 않고 **실제로 그려진 transform**을 읽는다 — 몸통 레이어마다
         * 진폭이 다르고(11 / 6.5 / 5.9 / 0px) 이징까지 걸려 있어, 따로 계산하면 렌더와 어긋난
         * 값이 나오고 그 어긋난 만큼 파란 면이 다시 뜬다.
         *
         * 물 변형본에는 몸통 레이어만 남으므로(나머지는 `hd`) 첫 레이어 그룹이 몸통 윤곽이다.
         * 못 읽으면 보정을 건너뛴다 — 최악이라도 지금까지와 같은 화면이다.
         */
        function syncFillToBody() {
          bodyLayer ??= waterContainer.querySelector<SVGGElement>("svg > g > g");
          const translateY = bodyLayer?.transform.baseVal.consolidate()?.matrix.f;
          if (translateY === undefined) return;
          restTranslateY ??= translateY;
          const offsetPercent = ((translateY - restTranslateY) / PIGBOX_CANVAS_HEIGHT) * 100;
          rootContainer.style.setProperty("--pigbox-body-offset", `${offsetPercent.toFixed(3)}%`);
        }

        removeFrameListener = baseAnimation.addEventListener("enterFrame", ({ currentTime }) => {
          waterAnimation.goToAndStop(currentTime, true);
          detailsAnimation.goToAndStop(currentTime, true);
          // 물 변형본을 옮긴 직후에 읽어야 이번 프레임의 몸통 위치가 나온다.
          syncFillToBody();
        });

        if (!animated) {
          removeCompleteListener = baseAnimation.addEventListener("complete", () => {
            for (const animation of animations) animation.goToAndStop(0, true);
          });
        }

        syncFillToBody();

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!animated || prefersReducedMotion) {
          for (const animation of animations) animation.goToAndStop(0, true);
          if (
            !prefersReducedMotion &&
            latestPlayRequestRef.current > lastPlayedRequestRef.current
          ) {
            lastPlayedRequestRef.current = latestPlayRequestRef.current;
            baseAnimation.goToAndPlay(clickStartFrameRef.current, true);
          }
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
      removeCompleteListener?.();
      removeFrameListener?.();
      for (const animation of animations) animation.destroy();
      animationsRef.current = [];
    };
  }, [animated]);

  useEffect(() => {
    latestPlayRequestRef.current = playRequest;
    if (
      animated ||
      playRequest <= lastPlayedRequestRef.current ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const baseAnimation = animationsRef.current[0];
    if (!baseAnimation) return;

    lastPlayedRequestRef.current = playRequest;
    baseAnimation.goToAndPlay(clickStartFrameRef.current, true);
  }, [animated, playRequest]);

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
      ref={rootRef}
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
        /*
         * 물높이와 아래 경계를 몸통이 움직인 만큼 같이 민다. 예전에는 둘 다 컨테이너에
         * 고정돼 있어서, 몸통이 내려갈 때 배 아래쪽이 잘려 파란 면이 비어 보였다
         * (진폭 11px = 캔버스 130px의 8.5%인데 아래 여백은 6%뿐이었다).
         */
        style={{
          clipPath:
            "inset(calc(var(--pigbox-fill-top) + var(--pigbox-body-offset)) 0 calc(6% - var(--pigbox-body-offset)) 0)",
        }}
        onTransitionEnd={() => setIsFillAnimating(false)}
      />
      <div ref={detailsRef} aria-hidden="true" className="absolute inset-0 z-30" />
    </div>
  );
}
