import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/api/provider", () => ({
  QueryProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("./_components/onboarding-route-guard", () => ({
  OnboardingRouteGuard: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("./_components/pending-mission-generation-recovery", () => ({
  PendingMissionGenerationRecovery: () => null,
}));

vi.mock("./_components/mixpanel-page-tracker", () => ({
  MixpanelPageTracker: () => null,
}));

vi.mock("./_components/safe-area-color", () => ({
  SafeAreaColor: () => null,
}));

import RootLayout from "./layout";

describe("RootLayout", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("개발 환경 기본값에서도 실제 API를 쓰는 앱 트리를 렌더한다", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("ENABLE_API_MOCKS", "");

    const markup = renderToStaticMarkup(
      <RootLayout>
        <main>실제 API 화면</main>
      </RootLayout>,
    );

    expect(markup).toContain("실제 API 화면");
  });
});
