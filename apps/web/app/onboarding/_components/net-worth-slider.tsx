"use client";

import { Slider } from "@repo/ui";
import { MAX_NET_WORTH_SLIDER_VALUE } from "@/app/onboarding/constants/amounts";

interface NetWorthSliderProps {
  netWorthAmount: number;
  onNetWorthAmountChange: (netWorthAmount: number) => void;
}

function formatNetWorthAmount(netWorthAmount: number) {
  return netWorthAmount.toLocaleString("ko-KR");
}

export function NetWorthSlider({ netWorthAmount, onNetWorthAmountChange }: NetWorthSliderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-title-t1-700 text-gray-900">
          자산 {formatNetWorthAmount(netWorthAmount)}만원
        </p>
        <p className="text-caption-c1-500 text-gray-500">
          현재 투자 및 예/적금 자산 모두 총합을 입력해주세요.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between text-body-b2-500 text-gray-400">
          <span>0</span>
          <span>1억원</span>
        </div>
        <Slider
          max={MAX_NET_WORTH_SLIDER_VALUE}
          min={0}
          step={100}
          thumbLabels={["순자산"]}
          value={[netWorthAmount]}
          onValueChange={([nextNetWorthAmount]) => {
            if (nextNetWorthAmount !== undefined) onNetWorthAmountChange(nextNetWorthAmount);
          }}
        />
      </div>
    </div>
  );
}
