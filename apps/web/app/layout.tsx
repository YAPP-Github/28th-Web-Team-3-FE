import { QueryProvider } from "@repo/api/provider";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { MixpanelPageTracker } from "./_components/mixpanel-page-tracker";
import "./globals.css";
import { MSWProvider } from "./msw-provider";

export const metadata: Metadata = {
  title: "아끼모",
  description: "목표 금액을 정하고 주간 절약 미션으로 모아가는 서비스",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const app = (
    <QueryProvider>
      {children}
      <Suspense fallback={null}>
        <MixpanelPageTracker />
      </Suspense>
    </QueryProvider>
  );
  return (
    <html lang="ko">
      <body>{process.env.NODE_ENV === "development" ? <MSWProvider>{app}</MSWProvider> : app}</body>
    </html>
  );
}
