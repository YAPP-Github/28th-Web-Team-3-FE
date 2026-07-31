"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

/** 웹과 WebView 클라이언트가 함께 쓰는 무난한 기본값. */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        // 재시도는 ky(`./client.ts`)가 GET에 한해 이미 수행한다(limit 2 + 백오프).
        // 여기서 또 켜면 두 레이어가 곱해져 GET 한 번이 최대 6요청이 되고, ky가
        // 재시도 대상에서 뺀 4xx까지 다시 던져 확정 실패에 왕복을 낭비한다.
        // 재시도 정책은 ky 한 곳에서만 정한다.
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });
}

/** 앱을 한 번만 감싼다. 리렌더링 사이에도 같은 클라이언트를 유지한다. */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(createQueryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
