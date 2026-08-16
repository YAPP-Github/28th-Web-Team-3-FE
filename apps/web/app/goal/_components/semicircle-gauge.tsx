interface SemicircleGaugeProps {
  /** 채움 비율 0–100. */
  percent: number;
  savedLabel: string;
  minLabel: string;
  maxLabel: string;
}

/**
 * 시안(node 2215:20075)에서 내보낸 링을 그대로 옮긴 좌표계다. 바깥지름 260, 두께 15이므로
 * 중심선 반지름은 122.5, 중심은 (130,130)이다. 반원보다 조금 길어 양 끝이 수평선보다
 * 2.1° 아래로 내려오고, 둥근 끝(round cap)이 y=142까지 닿아 뷰박스 높이가 142다.
 */
export const VIEWBOX_WIDTH = 260;
const VIEWBOX_HEIGHT = 142;
const STROKE_WIDTH = 15;
const ARC_CENTER = 130;
const ARC_RADIUS = 122.5;
/** 양 끝점의 y. 중심보다 4.5 아래라 호가 반원보다 조금 길다. */
const ARC_ENDPOINT_Y = 134.5;
/**
 * 끝점 x는 반지름과 끝점 y에서 유도한다. 소수점 아래를 반올림해 적으면 현(chord)과 반지름이
 * 어긋나 브라우저가 중심을 다시 잡고, 그만큼 정점이 뷰박스 위로 올라가 잘린다.
 */
const ARC_HALF_WIDTH = Math.sqrt(ARC_RADIUS ** 2 - (ARC_ENDPOINT_Y - ARC_CENTER) ** 2);
export const ARC_START_X = ARC_CENTER - ARC_HALF_WIDTH;
export const ARC_END_X = ARC_CENTER + ARC_HALF_WIDTH;
// 180°를 넘으므로 large-arc-flag는 1이다. sweep-flag 1이라 왼쪽 끝에서 위를 지나 오른쪽으로 간다.
export const ARC_PATH = `M ${ARC_START_X} ${ARC_ENDPOINT_Y} A ${ARC_RADIUS} ${ARC_RADIUS} 0 1 1 ${ARC_END_X} ${ARC_ENDPOINT_Y}`;

/** 끝 라벨은 시안대로 호 끝점 바로 아래에 가운데를 맞춘다. */
const MIN_LABEL_LEFT = `${(ARC_START_X / VIEWBOX_WIDTH) * 100}%`;
const MAX_LABEL_LEFT = `${(ARC_END_X / VIEWBOX_WIDTH) * 100}%`;

/** 저축 진행 게이지. recharts 없이 SVG stroke-dasharray로 그린다(정적·경량). */
export function SemicircleGauge({ percent, savedLabel, minLabel, maxLabel }: SemicircleGaugeProps) {
  return (
    <div className="flex flex-col items-center">
      {/* 시안은 호를 카드 폭 그대로 채우지 않는다 — 호(260)가 콘텐츠 폭(335)의 78%만
          차지하고 양옆에 여백을 둔다. w-full로 꽉 채우면 실제보다 굵고 넓어 보인다. */}
      <div className="w-full max-w-[78%]">
        <div className="relative w-full">
          <svg
            aria-hidden="true"
            className="w-full"
            fill="none"
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d={ARC_PATH}
              stroke="var(--color-gray-100)"
              strokeLinecap="round"
              strokeWidth={STROKE_WIDTH}
            />
            {/* percent 0이면 그리지 않는다 — 길이 0 대시 + round 캡이 시작점에 점으로 남는다. */}
            {percent > 0 && (
              <path
                d={ARC_PATH}
                pathLength={100}
                stroke="var(--color-blue-500)"
                strokeDasharray={`${percent} 100`}
                strokeLinecap="round"
                strokeWidth={STROKE_WIDTH}
              />
            )}
          </svg>

          <div className="absolute top-[44%] left-1/2 flex -translate-x-1/2 flex-col items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <p className="text-body-b2-500 text-gray-900">현재 저축액</p>
              <p className="whitespace-nowrap font-bold text-[32px] text-blue-500 leading-[38px] tracking-[-0.2px]">
                {savedLabel}
              </p>
            </div>
            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-body-b2-700 text-blue-600">
              {percent}%
            </span>
          </div>
        </div>

        {/* 라벨은 호 양 끝 위에 세우느라 박스 밖으로 조금 나간다 — 자르는 조상이 없어야 한다. */}
        <div className="relative mt-1.5 h-[18px] text-caption-c1-500 text-gray-400">
          <span
            className="-translate-x-1/2 absolute whitespace-nowrap"
            style={{ left: MIN_LABEL_LEFT }}
          >
            {minLabel}
          </span>
          <span
            className="-translate-x-1/2 absolute whitespace-nowrap"
            style={{ left: MAX_LABEL_LEFT }}
          >
            {maxLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
