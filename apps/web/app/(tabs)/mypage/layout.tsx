import type { ReactNode } from "react";

export default function MyPageLayout({ children }: { children: ReactNode }) {
  return <main className="flex-1 bg-gray-0">{children}</main>;
}
