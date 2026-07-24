import type { ReactNode } from "react";

interface SectionHeaderProps {
  children?: ReactNode;
  title: string;
}

/** 탭 홈에서 쓰는 섹션 제목. 우측 동작은 children으로 합성한다. */
export function SectionHeader({ children, title }: SectionHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4">
      <h2 className="text-title-t1-700 text-gray-900">{title}</h2>
      {children}
    </header>
  );
}
