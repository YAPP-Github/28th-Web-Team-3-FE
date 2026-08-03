import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@/lib/test/react";

const navigation = vi.hoisted(() => ({
  pathname: "/",
  redirect: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  redirect: navigation.redirect,
}));

vi.mock("@/api/auth", () => ({ getCurrentUser: vi.fn() }));

import { getCurrentUser } from "@/api/auth";
import { OnboardingRouteGuard } from "./onboarding-route-guard";

describe("OnboardingRouteGuard", () => {
  beforeEach(() => {
    navigation.pathname = "/";
    vi.clearAllMocks();
  });

  it("온보딩 미완료 사용자를 소개 화면으로 교체 이동한다", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ userId: 1, onboardingCompleted: false });

    render(
      <OnboardingRouteGuard>
        <p>홈</p>
      </OnboardingRouteGuard>,
    );

    await waitFor(() => expect(navigation.redirect).toHaveBeenCalledWith("/onboarding/intro"));
  });

  it("온보딩 완료 사용자를 홈으로 교체 이동한다", async () => {
    navigation.pathname = "/onboarding/intro";
    vi.mocked(getCurrentUser).mockResolvedValue({ userId: 1, onboardingCompleted: true });

    render(
      <OnboardingRouteGuard>
        <p>온보딩</p>
      </OnboardingRouteGuard>,
    );

    await waitFor(() => expect(navigation.redirect).toHaveBeenCalledWith("/"));
  });

  it("현재 경로가 사용자 상태에 맞으면 자식을 렌더한다", async () => {
    navigation.pathname = "/onboarding/age";
    vi.mocked(getCurrentUser).mockResolvedValue({ userId: 1, onboardingCompleted: false });

    render(
      <OnboardingRouteGuard>
        <p>온보딩 질문</p>
      </OnboardingRouteGuard>,
    );

    expect(await screen.findByText("온보딩 질문")).toBeInTheDocument();
    expect(navigation.redirect).not.toHaveBeenCalled();
  });
});
