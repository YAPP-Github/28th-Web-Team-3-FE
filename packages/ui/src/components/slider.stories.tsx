import type { Meta, StoryObj } from "@storybook/react";
import { Slider } from "./slider";

const meta = {
  title: "Components/Slider",
  component: Slider,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 나이 입력처럼 단일 값 선택. */
export const Single: Story = {
  args: { defaultValue: [29], min: 10, max: 80, step: 1 },
};

/** Figma 기준 단일 슬라이더 상태. */
export const FigmaDefault: Story = {
  args: { defaultValue: [56], min: 0, max: 100, step: 1, thumbLabels: ["값"] },
};

/** 금액 구간처럼 범위 선택. */
export const Range: Story = {
  args: { defaultValue: [1000, 5000], min: 0, max: 10000, step: 100 },
};

export const Disabled: Story = {
  args: { defaultValue: [50], disabled: true },
};
