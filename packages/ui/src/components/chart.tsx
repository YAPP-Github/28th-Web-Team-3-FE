"use client";

import * as React from "react";
import { ResponsiveContainer } from "recharts";
import { cn } from "../lib/utils";

export type ChartConfig = Record<string, { color: string; label?: React.ReactNode }>;

interface ChartContainerProps extends React.ComponentProps<"div"> {
  config: ChartConfig;
  children: React.ComponentProps<typeof ResponsiveContainer>["children"];
}

/** shadcn/ui ChartContainer 패턴을 프로젝트 토큰에 맞게 제공한다. */
export function ChartContainer({ className, config, children, ...props }: ChartContainerProps) {
  const chartId = React.useId().replace(/:/g, "");
  const chartStyle = Object.fromEntries(
    Object.entries(config).map(([key, value]) => [`--color-${key}`, value.color]),
  ) as React.CSSProperties;

  return (
    <div
      {...props}
      className={cn("flex justify-center", className)}
      data-chart={`chart-${chartId}`}
      style={{ ...chartStyle, ...props.style }}
    >
      <ResponsiveContainer>{children}</ResponsiveContainer>
    </div>
  );
}
