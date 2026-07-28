import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  render as baseRender,
  renderHook as baseRenderHook,
  type RenderHookOptions,
  type RenderOptions,
} from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

/**
 * react-query 훅을 쓰는 컴포넌트·훅용 render. `@testing-library/react` 대신 이 모듈에서
 * 가져오면 QueryClientProvider가 자동으로 감싸진다(RTL이 권장하는 custom render 패턴).
 *
 * 클라이언트는 render마다 새로 만든다 — 테스트 간에 캐시가 넘어가면 앞선 테스트의 응답이
 * 뒤 테스트에 그대로 보인다. retry는 끈다. 켜두면 실패 케이스가 재시도를 기다리느라 느려진다.
 */
function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

export function render(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return baseRender(ui, { wrapper: createWrapper(), ...options });
}

export function renderHook<TResult, TProps>(
  callback: (props: TProps) => TResult,
  options?: Omit<RenderHookOptions<TProps>, "wrapper">,
) {
  return baseRenderHook(callback, { wrapper: createWrapper(), ...options });
}

export { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
