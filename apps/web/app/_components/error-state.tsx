import { Button } from "@repo/ui";
import type { ReactNode } from "react";

type ErrorStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function ErrorState({ title, description, action }: ErrorStateProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex max-w-[320px] flex-col items-center gap-2">
        <h1 className="text-headline-h2-700 text-gray-900">{title}</h1>
        <p className="text-body-b2-400 text-gray-500">{description}</p>
      </div>
      {action}
    </main>
  );
}

export function RetryButton({ onClick }: { onClick: () => void }) {
  return (
    <Button className="min-w-30" onClick={onClick}>
      다시 시도
    </Button>
  );
}
