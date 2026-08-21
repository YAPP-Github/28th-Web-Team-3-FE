import { QueryProvider } from "@repo/api/provider";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { KeyboardInsetSync } from "./_components/keyboard-inset-sync";
import { MixpanelPageTracker } from "./_components/mixpanel-page-tracker";
import { OnboardingRouteGuard } from "./_components/onboarding-route-guard";
import { PendingMissionGenerationRecovery } from "./_components/pending-mission-generation-recovery";
import { SafeAreaColor } from "./_components/safe-area-color";
import "./globals.css";

export const metadata: Metadata = {
  title: "아끼모",
  description: "목표 금액을 정하고 주간 절약 미션으로 모아가는 서비스",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const app = (
    <QueryProvider>
      <KeyboardInsetSync />
      <PendingMissionGenerationRecovery />
      <OnboardingRouteGuard>{children}</OnboardingRouteGuard>
      <Suspense fallback={null}>
        <MixpanelPageTracker />
      </Suspense>
      <Suspense fallback={null}>
        <SafeAreaColor />
      </Suspense>
    </QueryProvider>
  );
  return (
    <html lang="ko">
      <body>{app}</body>
    </html>
  );
}
