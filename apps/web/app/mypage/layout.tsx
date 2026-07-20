import type { ReactNode } from "react";

export default function MyPageLayout({ children }: { children: ReactNode }) {
  return <main className="min-h-dvh bg-gray-0">{children}</main>;
}
