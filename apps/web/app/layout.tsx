import { QueryProvider } from "@repo/api/provider";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { MSWProvider } from "./MSWProvider";

export const metadata: Metadata = {
  title: "Web Team 3",
  description: "Next.js + Expo WebView monorepo",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        {process.env.NODE_ENV === "development" && <MSWProvider />}
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
