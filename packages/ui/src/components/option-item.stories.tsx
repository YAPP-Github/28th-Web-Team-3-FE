import type { Meta, StoryObj } from "@storybook/react";
import { OptionGroup, OptionItem } from "./option-item";

const meta = {
  title: "Components/OptionItem",
  component: OptionGroup,
  parameters: { layout: "padded" },
} satisfies Meta<typeof OptionGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 설문 단일선택 세로 리스트. */
export const List: Story = {
  render: () => (
    <OptionGroup defaultValue="half" aria-label="금융자산 규모">
      <OptionItem value="none">거의 없어요</OptionItem>
      <OptionItem value="below-half">절반 이하예요</OptionItem>
      <OptionItem value="half">절반 정도예요</OptionItem>
      <OptionItem value="above-half">절반 이상이에요</OptionItem>
      <OptionItem value="all">거의 전부예요</OptionItem>
    </OptionGroup>
  ),
};

/** 나이대처럼 2열 그리드 배치. */
export const Grid: Story = {
  render: () => (
    <OptionGroup defaultValue="20s" className="grid grid-cols-2" aria-label="나이대">
      <OptionItem value="10s">10대</OptionItem>
      <OptionItem value="20s">20대</OptionItem>
      <OptionItem value="30s">30대</OptionItem>
      <OptionItem value="40s">40대</OptionItem>
      <OptionItem value="50s">50대</OptionItem>
      <OptionItem value="60s">60대 이상</OptionItem>
    </OptionGroup>
  ),
};
