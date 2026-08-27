import { expect, type Page, test } from "./fixtures";

test.use({ viewport: { width: 375, height: 812 } });

/**
 * 누르는 표시가 hover 표시보다 진해야 한다.
 *
 * 같은 색으로 두면, 터치인데도 hover를 지원한다고 보고하는 기기(삼성 WebView 등)에서
 * 첫 탭 뒤 hover가 눌린 채 남아 두 번째부터는 회색에서 같은 회색으로 바뀐다 — 눌러도
 * 아무 변화가 없어 먹은 것처럼 보인다.
 *
 * 데스크톱 브라우저는 `(hover: hover)`라 hover 규칙이 그대로 걸린다. 그 상태에서
 * 눌렀을 때 색이 또 한 번 바뀌는지를 본다 — 고착된 기기와 같은 조건이다.
 */
/** 색은 100ms에 걸쳐 번지므로 전환이 끝난 뒤에 읽는다 — 중간값을 읽으면 결과가 흔들린다. */
const TRANSITION_SETTLE_MS = 250;

async function settledBackgroundOf(page: Page, locator: ReturnType<Page["getByRole"]>) {
  await page.waitForTimeout(TRANSITION_SETTLE_MS);
  return locator.evaluate((el) => getComputedStyle(el).backgroundColor);
}

async function mockCurrentUser(page: Page) {
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ userId: 1, onboardingCompleted: true }),
    }),
  );
}

/** hover가 붙으면 색이 변하고, 그 위에서 누르면 한 번 더 변해야 한다. */
async function expectPressReadableUnderHover(page: Page, locator: ReturnType<Page["getByRole"]>) {
  const idle = await settledBackgroundOf(page, locator);

  await locator.hover();
  const hovered = await settledBackgroundOf(page, locator);

  await page.mouse.down();
  const pressed = await settledBackgroundOf(page, locator);
  await page.mouse.up();

  expect(hovered).not.toBe(idle);
  expect(pressed).not.toBe(hovered);
}

test("마이페이지 설정 행은 hover가 남아 있어도 누른 표시가 따로 보인다", async ({ page }) => {
  await mockCurrentUser(page);
  await page.goto("/mypage");
  await expect(page.getByRole("heading", { name: "마이페이지" })).toBeVisible();

  await expectPressReadableUnderHover(page, page.getByRole("link", { name: "내 정보" }));
});

test("목표 상세 수정 링크도 hover가 남아 있어도 누른 표시가 따로 보인다", async ({ page }) => {
  await mockCurrentUser(page);
  await page.route("**/api/v2/goal", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        targetAmountManwon: 5000,
        periodMonths: 16,
        totalSavedManwon: 1950,
        progressPercent: 39,
        usageMonths: 8,
        deadlineDDay: 240,
        thisMonth: { targetManwon: 190, savedManwon: 100, progressPercent: 53, dDay: 12 },
        monthlySavings: [{ yearMonth: "2026-08", savedManwon: 100, current: true }],
      }),
    }),
  );
  await page.goto("/goal");

  const edit = page.getByRole("link", { name: "수정" });
  await expect(edit).toBeVisible();

  await expectPressReadableUnderHover(page, edit);
});
