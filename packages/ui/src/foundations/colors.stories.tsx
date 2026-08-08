import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useRef, useState } from "react";

/** 디자인 토큰 쇼케이스. globals.css의 원시 팔레트와 시맨틱 토큰을 그대로 렌더링한다.
 * 토큰 변경 PR에서 Chromatic 시각 diff의 기준점 역할.
 * 클래스는 문자열 리터럴로 나열 — Tailwind v4는 스캐너에 안 잡힌 테마 변수를
 * tree-shake하므로 inline style var() 참조로는 스와치가 렌더되지 않는다. */

const BLUE = [
  "bg-blue-50",
  "bg-blue-100",
  "bg-blue-200",
  "bg-blue-300",
  "bg-blue-400",
  "bg-blue-500",
  "bg-blue-600",
  "bg-blue-700",
  "bg-blue-800",
  "bg-blue-900",
];
const GRAY = [
  "bg-gray-0",
  "bg-gray-10",
  "bg-gray-50",
  "bg-gray-100",
  "bg-gray-200",
  "bg-gray-300",
  "bg-gray-400",
  "bg-gray-500",
  "bg-gray-600",
  "bg-gray-700",
  "bg-gray-800",
  "bg-gray-900",
];
const STATUS = [
  "bg-error",
  "bg-error-light",
  "bg-warning",
  "bg-success",
  "bg-dim-light",
  "bg-dim-dark",
];
const SEMANTIC = [
  "bg-background",
  "bg-foreground",
  "bg-primary",
  "bg-primary-foreground",
  "bg-secondary",
  "bg-secondary-foreground",
  "bg-muted",
  "bg-muted-foreground",
  "bg-destructive",
  "bg-border",
  "bg-input",
  "bg-ring",
];

function Swatch({ bgClass }: { bgClass: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [resolved, setResolved] = useState("");

  useEffect(() => {
    if (ref.current) {
      setResolved(getComputedStyle(ref.current).backgroundColor);
    }
  }, []);

  return (
    <div className="w-28">
      <div ref={ref} className={`h-14 rounded-md border border-gray-100 ${bgClass}`} />
      <p className="mt-1 text-caption-c1-500 text-gray-900">{bgClass.replace("bg-", "")}</p>
      <p className="text-caption-c1-400 text-gray-500">{resolved}</p>
    </div>
  );
}

function Palette({ title, classes }: { title: string; classes: string[] }) {
  return (
    <section>
      <h2 className="mb-2 text-title-t2-700 text-gray-900">{title}</h2>
      <div className="flex flex-wrap gap-3">
        {classes.map((bgClass) => (
          <Swatch key={bgClass} bgClass={bgClass} />
        ))}
      </div>
    </section>
  );
}

const meta = {
  title: "Foundations/Colors",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {
  render: () => (
    <div className="flex flex-col gap-8 bg-background p-4">
      <Palette title="Primary (Blue)" classes={BLUE} />
      <Palette title="Grayscale" classes={GRAY} />
      <Palette title="Status / Dim" classes={STATUS} />
      <Palette title="Semantic" classes={SEMANTIC} />
    </div>
  ),
};
