import { Slider } from "@repo/ui";

interface LabelSliderProps {
  amount: number;
  amountLabel: string;
  helperMessage: string;
  maxAmount: number;
  onAmountChange: (amount: number) => void;
}

export function LabelSlider({
  amount,
  amountLabel,
  helperMessage,
  maxAmount,
  onAmountChange,
}: LabelSliderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-title-t1-700 text-gray-900">
          {amountLabel} {amount.toLocaleString("ko-KR")}만원
        </p>
        <p className="text-caption-c1-500 text-gray-500">{helperMessage}</p>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between text-body-b2-500 text-gray-400">
          <span>0</span>
          <span>{maxAmount.toLocaleString("ko-KR")}만원</span>
        </div>
        <Slider
          max={maxAmount}
          min={0}
          step={10}
          thumbLabels={[amountLabel]}
          value={[amount]}
          onValueChange={([nextAmount]) => {
            if (nextAmount !== undefined) {
              onAmountChange(nextAmount);
            }
          }}
        />
      </div>
    </div>
  );
}
