import { expect, test } from "@playwright/test";

/**
 * 저장 목록이 필터 칩에서 별도 화면으로 빠지기 전의 링크. 페이지에서 `searchParams`로
 * 처리하면 `/benefits`가 동적 렌더가 돼 탭 진입이 느려지므로 `next.config.ts`의 redirects가
 * 맡는다 — 설정이 지워져도 여기서 걸린다.
 */
test("옛 저장 링크는 저장됨 화면으로 보낸다", async ({ page }) => {
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({ json: { userId: 1, onboardingCompleted: true } }),
  );
  await page.route("**/api/bookmarks**", (route) => route.fulfill({ json: [] }));

  await page.goto("/benefits?category=saved");

  // Next의 redirects는 쿼리를 목적지로 그대로 넘긴다. 저장됨 화면은 searchParams를 읽지
  // 않으므로 남은 `?category=saved`는 표시상 흔적일 뿐이다 — 경로만 확인한다.
  await expect(page).toHaveURL(/\/benefits\/saved(\?|$)/);
  await expect(page.getByRole("heading", { name: "저장됨" })).toBeVisible();
});
