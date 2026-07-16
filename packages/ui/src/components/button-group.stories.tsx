import type { Meta, StoryObj } from "@storybook/react";
import { ButtonGroup } from "./button-group";

const meta = {
  title: "Components/ButtonGroup",
  component: ButtonGroup,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { onPrev: () => {}, onNext: () => {} },
};

/** 답변 전 — 다음 비활성. */
export const NextDisabled: Story = {
  args: { onPrev: () => {}, nextDisabled: true },
};

/** 퍼널 첫 화면 — 이전 없이 단독 CTA. */
export const FirstStep: Story = {
  args: { onNext: () => {} },
};

/** 바텀시트 완료 버튼처럼 라벨 교체. */
export const CustomLabel: Story = {
  args: { nextLabel: "완료", nextDisabled: true },
};
