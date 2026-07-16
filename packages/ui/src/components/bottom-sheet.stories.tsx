import type { Meta, StoryObj } from "@storybook/react";
import { AmountField } from "./amount-field";
import { BottomSheet } from "./bottom-sheet";
import { Button } from "./button";
import { ButtonGroup } from "./button-group";

const meta = {
  title: "Components/BottomSheet",
  component: BottomSheet,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 직접 입력 시트 — 트리거 눌러서 열기. */
export const DirectInput: Story = {
  args: { title: "직접 입력" },
  render: (args) => (
    <div className="flex h-96 items-center justify-center">
      <BottomSheet {...args} trigger={<Button variant="secondary">직접 입력 열기</Button>}>
        <div className="flex flex-col gap-12 pt-6">
          <div className="flex gap-2 px-5">
            <AmountField label="월급" value="500" readOnly />
            <AmountField label="월 저축액" value="" readOnly />
          </div>
          <div className="px-5 pt-2 pb-3">
            <ButtonGroup nextLabel="완료" nextDisabled />
          </div>
        </div>
      </BottomSheet>
    </div>
  ),
};
