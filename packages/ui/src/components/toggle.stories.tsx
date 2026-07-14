import type { Meta, StoryObj } from "@storybook/react";
import { Heart } from "lucide-react";
import { Toggle } from "./toggle";

const meta = {
  title: "Components/Toggle",
  component: Toggle,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Toggle" },
};

export const WithIcon: Story = {
  args: { children: <Heart className="size-4" /> },
};

export const Outline: Story = {
  args: { variant: "outline", children: "Toggle" },
};

/** 온보딩 플로우 전용 — 선택 전/후 배경·텍스트 색이 뚜렷하게 갈리는 칩형 토글. */
export const Onboarding: Story = {
  args: { variant: "onboarding", children: "Toggle" },
};

export const OnboardingPressed: Story = {
  args: { variant: "onboarding", defaultPressed: true, children: "Toggle" },
};

export const Pressed: Story = {
  args: { defaultPressed: true, children: "Toggle" },
};

export const Disabled: Story = {
  args: { disabled: true, children: "Toggle" },
};
