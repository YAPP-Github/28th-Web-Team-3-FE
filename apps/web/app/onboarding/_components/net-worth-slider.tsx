"use client";

import { Slider } from "@repo/ui";
import { NET_WORTH_SLIDER_MAX } from "../constants/amounts";

interface NetWorthSliderProps {
  value: string;
  onValueChange: (value: string) => void;
}

function formatAmount(value: string) {
  return BigInt(value || "0").toLocaleString("ko-KR");
}

export function NetWorthSlider({ value, onValueChange }: NetWorthSliderProps) {
  const isAboveSliderMax = BigInt(value || "0") > BigInt(NET_WORTH_SLIDER_MAX);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-title-t1-700 text-gray-900">자산 {formatAmount(value)}만원</p>
        <p className="text-caption-c1-500 text-gray-500">
          현재 투자 및 예/적금 자산 모두 총합을 입력해주세요.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between text-body-b2-500 text-gray-400">
          <span>0</span>
          <span>1억원</span>
        </div>
        {isAboveSliderMax ? (
          <button
            aria-label="순자산 슬라이더 활성화"
            className="flex h-8 w-full items-center"
            type="button"
            onClick={() => onValueChange(String(NET_WORTH_SLIDER_MAX))}
          >
            <span className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
              <span className="block h-full w-full bg-primary" />
            </span>
          </button>
        ) : (
          <Slider
            max={NET_WORTH_SLIDER_MAX}
            min={0}
            step={100}
            thumbLabels={["순자산"]}
            value={[Number(value || 0)]}
            onValueChange={([nextValue]) => {
              if (nextValue !== undefined) {
                onValueChange(String(nextValue));
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
