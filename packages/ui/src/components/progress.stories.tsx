import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "./progress";

const meta = {
  title: "Components/Progress",
  component: Progress,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Start: Story = { args: { value: 10 } };
export const Half: Story = { args: { value: 50 } };
export const Done: Story = { args: { value: 100 } };
