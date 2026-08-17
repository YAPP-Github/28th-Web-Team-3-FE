import { cn } from "@repo/ui";
import type { ReactNode } from "react";

interface ChatQuestionProps {
  children?: ReactNode;
  current: number;
  helper: string;
  prompt: string;
  promptClassName?: string;
  className?: string;
}

export function ChatQuestion({
  children,
  current,
  helper,
  prompt,
  promptClassName,
  className,
}: ChatQuestionProps) {
  return (
    <section
      aria-label={`${current}번째 질문`}
      className={cn(
        "flex w-fit max-w-full flex-col gap-4 rounded-[20px] bg-gray-50 p-4",
        className,
      )}
    >
      <div className="flex flex-col gap-0.5">
        <p className="text-caption-c1-500 text-gray-500">
          <span className="text-primary">{current}</span>/{4}
        </p>
        <div>
          <h2 className={cn("text-pretty text-body-b2-500 text-[#171717]", promptClassName)}>
            {prompt}
          </h2>
          <p className="text-caption-c1-500 text-gray-400">{helper}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
