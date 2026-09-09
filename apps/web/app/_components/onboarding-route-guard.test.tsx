import { QueryClient } from "@tanstack/react-query";
import { HTTPError, type NormalizedOptions } from "ky";
import { Component, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@/lib/test/react";

const navigation = vi.hoisted(() => ({
  pathname: "/",
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ replace: navigation.replace }),
}));

vi.mock("@/api/auth", () => ({ getCurrentUser: vi.fn() }));

import { getCurrentUser } from "@/api/auth";
import { currentUserOptions } from "@/lib/queries/auth";
import { OnboardingRouteGuard } from "./onboarding-route-guard";

class TestErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  override state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  override render() {
    if (this.state.error) return <p>{this.state.error.message}</p>;
    return this.props.children;
  }
}

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

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/onboarding/intro"));
  });

  it("홈의 온보딩 완료 여부를 확인하는 동안 중앙 스피너 대신 홈 스켈레톤을 보여준다", () => {
    vi.mocked(getCurrentUser).mockReturnValue(new Promise(() => {}));

    render(
      <OnboardingRouteGuard>
        <p>홈 본문</p>
      </OnboardingRouteGuard>,
    );

    expect(screen.getByRole("heading", { name: "홈" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("홈을 불러오는 중");
    expect(screen.queryByText("홈 본문")).not.toBeInTheDocument();
  });

  it("온보딩 완료 사용자를 홈으로 교체 이동한다", async () => {
    navigation.pathname = "/onboarding/intro";
    vi.mocked(getCurrentUser).mockResolvedValue({ userId: 1, onboardingCompleted: true });

    render(
      <OnboardingRouteGuard>
        <p>온보딩</p>
      </OnboardingRouteGuard>,
    );

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/"));
    expect(screen.getByRole("heading", { name: "홈" })).toBeInTheDocument();
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
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it("현재 사용자 조회 실패를 에러 바운더리에 전파한다", async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(new Error("network error"));

    render(
      <TestErrorBoundary>
        <OnboardingRouteGuard>
          <p>홈</p>
        </OnboardingRouteGuard>
      </TestErrorBoundary>,
    );

    expect(await screen.findByText("network error")).toBeInTheDocument();
  });

  it("캐시된 사용자의 일시적인 재조회 실패는 자식을 유지한다", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { gcTime: 0, retry: false, staleTime: Number.POSITIVE_INFINITY } },
    });
    queryClient.setQueryData(currentUserOptions().queryKey, {
      userId: 1,
      onboardingCompleted: true,
    });
    vi.mocked(getCurrentUser).mockRejectedValue(new Error("network error"));

    render(
      <OnboardingRouteGuard>
        <p>홈</p>
      </OnboardingRouteGuard>,
      { queryClient },
    );

    await act(async () => {
      await queryClient.refetchQueries({ queryKey: currentUserOptions().queryKey });
    });

    await waitFor(() =>
      expect(queryClient.getQueryState(currentUserOptions().queryKey)?.status).toBe("error"),
    );
    expect(screen.getByText("홈")).toBeInTheDocument();
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it("캐시된 사용자의 일시적인 재조회 실패에도 온보딩 상태로 이동한다", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { gcTime: 0, retry: false, staleTime: Number.POSITIVE_INFINITY } },
    });
    queryClient.setQueryData(currentUserOptions().queryKey, {
      userId: 1,
      onboardingCompleted: false,
    });
    vi.mocked(getCurrentUser).mockRejectedValue(new Error("network error"));

    render(
      <OnboardingRouteGuard>
        <p>홈</p>
      </OnboardingRouteGuard>,
      { queryClient },
    );

    await act(async () => {
      await queryClient.refetchQueries({ queryKey: currentUserOptions().queryKey });
    });

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/onboarding/intro"));
    expect(screen.queryByText("network error")).not.toBeInTheDocument();
  });

  it.each([
    401, 403,
  ])("캐시된 사용자의 %s 재조회 실패는 에러 바운더리에 전파한다", async (status) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { gcTime: 0, retry: false, staleTime: Number.POSITIVE_INFINITY } },
    });
    queryClient.setQueryData(currentUserOptions().queryKey, {
      userId: 1,
      onboardingCompleted: true,
    });
    const authError = new HTTPError(
      new Response(null, { status }),
      new Request("http://localhost/auth/me"),
      {} as NormalizedOptions,
    );
    vi.mocked(getCurrentUser).mockRejectedValue(authError);

    render(
      <TestErrorBoundary>
        <OnboardingRouteGuard>
          <p>홈</p>
        </OnboardingRouteGuard>
      </TestErrorBoundary>,
      { queryClient },
    );

    await act(async () => {
      await queryClient.refetchQueries({ queryKey: currentUserOptions().queryKey });
    });

    await waitFor(() =>
      expect(queryClient.getQueryState(currentUserOptions().queryKey)?.status).toBe("error"),
    );
    expect(await screen.findByText(authError.message)).toBeInTheDocument();
  });
});
