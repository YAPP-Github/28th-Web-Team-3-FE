import { test as base, expect } from "@playwright/test";

export type { Page } from "@playwright/test";
export { expect };

/**
 * 각 테스트가 선언하지 않은 API 요청을 즉시 실패시킨다.
 * 목 누락이 로컬 백엔드 프록시로 빠져도 테스트가 통과하는 거짓 양성을 막는다.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    const unmatchedApiRequests = new Set<string>();

    await page.route("**/api/**", (route) => {
      unmatchedApiRequests.add(route.request().url());
      return route.abort("blockedbyclient");
    });

    await use(page);

    expect([...unmatchedApiRequests], "목 처리되지 않은 API 요청이 있습니다.").toEqual([]);
  },
});
