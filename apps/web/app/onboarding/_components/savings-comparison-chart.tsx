interface SavingsComparisonChartProps {
  currentEstimate: number;
  improvedEstimate: number;
}

const MAX_BAR_HEIGHT = 108;
const MIN_VISUAL_GAP = 27;
const MAX_VISUAL_GAP = 54;

function formatAmount(amount: number) {
  return `${Math.round(amount).toLocaleString("ko-KR")}만원`;
}

function getVisualHeights(currentEstimate: number, improvedEstimate: number) {
  const maxEstimate = Math.max(currentEstimate, improvedEstimate, 1);
  const difference = Math.abs(improvedEstimate - currentEstimate);
  const proportionalGap = Math.round((difference / maxEstimate) * MAX_BAR_HEIGHT * 4);
  const visualGap =
    difference === 0 ? 0 : Math.min(MAX_VISUAL_GAP, Math.max(MIN_VISUAL_GAP, proportionalGap));

  return improvedEstimate >= currentEstimate
    ? { currentHeight: MAX_BAR_HEIGHT - visualGap, improvedHeight: MAX_BAR_HEIGHT }
    : { currentHeight: MAX_BAR_HEIGHT, improvedHeight: MAX_BAR_HEIGHT - visualGap };
}

export function SavingsComparisonChart({
  currentEstimate,
  improvedEstimate,
}: SavingsComparisonChartProps) {
  const { currentHeight, improvedHeight } = getVisualHeights(currentEstimate, improvedEstimate);

  return (
    <div
      aria-label={`예상 자산 비교: 예상 금액 ${formatAmount(currentEstimate)}, 서비스 이용 시 ${formatAmount(improvedEstimate)}`}
      className="relative mt-5 h-44 w-full"
      role="img"
    >
      <div className="absolute inset-x-0 top-0 h-[136px] border-gray-400 border-b border-dashed">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 z-10 h-0.5 bg-blue-300"
          style={{ bottom: currentHeight }}
        />

        <div className="absolute inset-0 flex items-end justify-center gap-8">
          <div className="flex h-full w-[55px] flex-col items-center justify-end">
            <span className="mb-1 shrink-0 whitespace-nowrap text-body-b1-500 text-gray-600 tabular-nums">
              {formatAmount(currentEstimate)}
            </span>
            <div
              className="w-[55px] shrink-0 rounded-t-md bg-gradient-to-b from-gray-200 to-gray-100"
              data-testid="current-savings-bar"
              style={{ height: currentHeight }}
            />
          </div>

          <div className="flex h-full w-[55px] flex-col items-center justify-end">
            <span className="mb-1 shrink-0 whitespace-nowrap text-body-b1-700 text-gray-600 tabular-nums">
              {formatAmount(improvedEstimate)}
            </span>
            <div
              className="w-[55px] shrink-0 rounded-t-md bg-gray-900"
              data-testid="improved-savings-bar"
              style={{ height: improvedHeight }}
            />
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 top-[142px] flex justify-center gap-8">
        <span className="w-[55px] whitespace-nowrap text-center text-body-b1-500 text-gray-600">
          예상 금액
        </span>
        <span className="w-[55px] whitespace-nowrap text-center text-body-b1-700 text-gray-600">
          서비스 이용시
        </span>
      </div>
    </div>
  );
}
