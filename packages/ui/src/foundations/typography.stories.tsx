import type { Meta, StoryObj } from "@storybook/react";

/** 타이포그래피 토큰 쇼케이스. tokens.generated.css의 @utility text-* 클래스를
 * 전부 렌더링한다. 클래스명은 Tailwind 스캐너가 인식하도록 문자열 리터럴로 나열. */

const TEXT_STYLES = [
  "text-headline-h1-700",
  "text-headline-h1-500",
  "text-headline-h2-700",
  "text-headline-h2-500",
  "text-headline-h2-400",
  "text-title-t1-700",
  "text-title-t1-500",
  "text-title-t1-400",
  "text-title-t2-700",
  "text-title-t2-500",
  "text-title-t2-400",
  "text-body-b1-700",
  "text-body-b1-500",
  "text-body-b1-400",
  "text-body-b2-700",
  "text-body-b2-500",
  "text-body-b2-400",
  "text-caption-c1-700",
  "text-caption-c1-500",
  "text-caption-c1-400",
];

const SAMPLE = "다람쥐 헌 쳇바퀴에 타고파 Sphinx 0123";

const meta = {
  title: "Foundations/Typography",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {
  render: () => (
    <div className="flex flex-col gap-4 bg-background p-4">
      {TEXT_STYLES.map((cls) => (
        <div key={cls} className="flex items-baseline gap-6">
          <code className="w-52 shrink-0 text-caption-c1-400 text-gray-500">
            {cls.replace("text-", "")}
          </code>
          <p className={`${cls} text-gray-900`}>{SAMPLE}</p>
        </div>
      ))}
    </div>
  ),
};
