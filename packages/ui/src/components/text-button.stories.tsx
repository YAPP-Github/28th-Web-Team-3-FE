import type { Meta, StoryObj } from "@storybook/react";
import { TextButton } from "./text-button";

const meta = {
  title: "Components/TextButton",
  component: TextButton,
  args: { children: "직접 입력" },
} satisfies Meta<typeof TextButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
