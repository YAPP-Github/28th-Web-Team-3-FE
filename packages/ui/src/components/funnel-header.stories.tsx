import type { Meta, StoryObj } from "@storybook/react";
import { FunnelHeader } from "./funnel-header";

const meta = {
  title: "Components/FunnelHeader",
  component: FunnelHeader,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof FunnelHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MidFunnel: Story = {
  args: { step: 3, totalSteps: 10, onBack: () => {} },
};

/** 첫 화면 — onBack 없으면 뒤로가기 버튼이 숨는다. */
export const FirstStep: Story = {
  args: { step: 1, totalSteps: 10 },
};

export const LastStep: Story = {
  args: { step: 10, totalSteps: 10, onBack: () => {} },
};
