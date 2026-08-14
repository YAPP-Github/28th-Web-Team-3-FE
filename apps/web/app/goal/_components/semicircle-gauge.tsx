interface SemicircleGaugeProps {
  /** 채움 비율 0–100. */
  percent: number;
  savedLabel: string;
  minLabel: string;
  maxLabel: string;
}

// 반원 호: 반지름 104, 중심 (120,120). 좌(16,120) → 위로 볼록 → 우(224,120).
// stroke 16이라 위/좌우 여백을 8 이상 둬 잘리지 않게 한다.
const ARC_PATH = "M 16 120 A 104 104 0 0 1 224 120";

/** 저축 진행 반원 게이지. recharts 없이 SVG stroke-dasharray로 그린다(정적·경량). */
export function SemicircleGauge({ percent, savedLabel, minLabel, maxLabel }: SemicircleGaugeProps) {
  return (
    <div className="flex flex-col items-center">
      {/* 피그마 목표 상세(node 2215:20074)는 호를 카드 폭 그대로 채우지 않는다 — 호(260)가
          콘텐츠 폭(335)의 78%만 차지하고 양옆에 여백을 둔다. w-full로 꽉 채우면 실제보다
          굵고 넓어 보인다. */}
      <div className="w-full max-w-[78%]">
        <div className="relative w-full">
          <svg
            aria-hidden="true"
            className="w-full"
            fill="none"
            viewBox="0 0 240 128"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d={ARC_PATH}
              stroke="var(--color-gray-200)"
              strokeLinecap="round"
              strokeWidth={16}
            />
            {/* percent 0이면 그리지 않는다 — 길이 0 대시 + round 캡이 시작점에 점으로 남는다. */}
            {percent > 0 && (
              <path
                d={ARC_PATH}
                pathLength={100}
                stroke="var(--color-blue-500)"
                strokeDasharray={`${percent} 100`}
                strokeLinecap="round"
                strokeWidth={16}
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

        <div className="mt-1.5 flex w-full justify-between px-1.5 text-caption-c1-500 text-gray-400">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      </div>
    </div>
  );
}
