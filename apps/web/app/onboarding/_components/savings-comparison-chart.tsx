"use client";

import { type ChartConfig, ChartContainer } from "@repo/ui";
import { Bar, BarChart, Cell, LabelList, ReferenceLine, XAxis, YAxis } from "recharts";

interface SavingsComparisonChartProps {
  currentEstimate: number;
  improvedEstimate: number;
}

const chartConfig = {
  current: { color: "var(--color-gray-200)", label: "예상 금액" },
  improved: { color: "var(--color-gray-900)", label: "서비스 이용 시" },
} satisfies ChartConfig;

function formatAmount(amount: number) {
  return `${Math.round(amount).toLocaleString("ko-KR")}만원`;
}

export function SavingsComparisonChart({
  currentEstimate,
  improvedEstimate,
}: SavingsComparisonChartProps) {
  const chartData = [
    { amount: currentEstimate, label: chartConfig.current.label, type: "current" },
    { amount: improvedEstimate, label: chartConfig.improved.label, type: "improved" },
  ];

  return (
    <ChartContainer
      aria-label="예상 자산 비교 차트"
      className="h-44 w-full"
      config={chartConfig}
      role="img"
    >
      <BarChart
        accessibilityLayer
        data={chartData}
        margin={{ bottom: 0, left: 0, right: 0, top: 34 }}
      >
        <YAxis domain={[0, "dataMax"]} hide />
        <XAxis
          axisLine={{ stroke: "var(--color-gray-400)", strokeDasharray: "3 3" }}
          dataKey="label"
          tick={{ fill: "var(--color-gray-600)", fontSize: 16, fontWeight: 500 }}
          tickLine={false}
        />
        <ReferenceLine stroke="var(--color-blue-300)" strokeWidth={2} y={currentEstimate} />
        <Bar dataKey="amount" maxBarSize={55} radius={[6, 6, 0, 0]}>
          <LabelList
            dataKey="amount"
            formatter={(value) => formatAmount(Number(value))}
            position="top"
            style={{ fill: "var(--color-gray-600)", fontSize: 16, fontWeight: 700 }}
          />
          {chartData.map((item) => (
            <Cell key={item.type} fill={`var(--color-${item.type})`} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
