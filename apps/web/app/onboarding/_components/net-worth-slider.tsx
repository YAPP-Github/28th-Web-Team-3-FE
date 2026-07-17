"use client";

import { Slider } from "@repo/ui";
import { MAX_NET_WORTH_SLIDER_VALUE } from "../constants/amounts";

interface NetWorthSliderProps {
  netWorthAmount: string;
  onNetWorthAmountChange: (netWorthAmount: string) => void;
}

function formatNetWorthAmount(netWorthAmount: string) {
  return BigInt(netWorthAmount || "0").toLocaleString("ko-KR");
}

export function NetWorthSlider({ netWorthAmount, onNetWorthAmountChange }: NetWorthSliderProps) {
  const exceedsSliderMaximum = BigInt(netWorthAmount || "0") > BigInt(MAX_NET_WORTH_SLIDER_VALUE);

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
        {exceedsSliderMaximum ? (
          <button
            aria-label="순자산 슬라이더 활성화"
            className="flex h-8 w-full items-center"
            type="button"
            onClick={() => onNetWorthAmountChange(String(MAX_NET_WORTH_SLIDER_VALUE))}
          >
            <span className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
              <span className="block h-full w-full bg-primary" />
            </span>
          </button>
        ) : (
          <Slider
            max={MAX_NET_WORTH_SLIDER_VALUE}
            min={0}
            step={100}
            thumbLabels={["순자산"]}
            value={[Number(netWorthAmount || 0)]}
            onValueChange={([nextNetWorthAmount]) => {
              if (nextNetWorthAmount !== undefined) {
                onNetWorthAmountChange(String(nextNetWorthAmount));
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
