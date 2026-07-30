import { QueryProvider } from "@repo/api/provider";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { MixpanelPageTracker } from "./_components/mixpanel-page-tracker";
import "./globals.css";
import { MSWProvider } from "./msw-provider";

export const metadata: Metadata = {
  title: "Web Team 3",
  description: "Next.js + Expo WebView monorepo",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const app = (
    <Suspense fallback={null}>
      <QueryProvider>
        {children}
        <Suspense fallback={null}>
          <MixpanelPageTracker />
        </Suspense>
      </QueryProvider>
    </Suspense>
  );
  return (
    <html lang="ko">
      <body>{process.env.NODE_ENV === "development" ? <MSWProvider>{app}</MSWProvider> : app}</body>
    </html>
  );
}
