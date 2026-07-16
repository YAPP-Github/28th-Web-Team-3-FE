import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { AmountField } from "./amount-field";

const meta = {
  title: "Components/AmountField",
  component: AmountField,
  parameters: { layout: "padded" },
  args: { label: "월급" },
} satisfies Meta<typeof AmountField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { value: "" },
};

export const Filled: Story = {
  args: { value: "500" },
};

/** 제어 입력 — 클릭해서 포커스 보더 확인. */
export const Interactive: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <AmountField
        {...args}
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
      />
    );
  },
};

/** 월급/저축액처럼 두 개 나란히. */
export const Pair: Story = {
  render: () => (
    <div className="flex gap-2">
      <AmountField label="월급" value="500" readOnly />
      <AmountField label="월 저축액" value="" readOnly />
    </div>
  ),
};
