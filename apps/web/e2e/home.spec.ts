import { expect, type Page, test } from "@playwright/test";

async function mockCurrentUser(page: Page, onboardingCompleted: boolean) {
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ userId: 1, onboardingCompleted }),
    }),
  );
}

// 인증은 네이티브 셸(bridge) 몫이라 브라우저 e2e에는 토큰이 없다.
// API 응답을 목으로 세워 화면 렌더만 검증한다.
test("home page renders", async ({ page }) => {
  await mockCurrentUser(page, true);

  await page.route("**/api/v2/goal", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        targetAmountManwon: 5_000,
        periodMonths: 16,
        totalSavedManwon: 1_950,
        progressPercent: 100,
        usageMonths: 8,
        deadlineDDay: 486,
        thisMonth: { targetManwon: 82, savedManwon: 67, progressPercent: 82, dDay: 12 },
        monthlySavings: [
          { yearMonth: "2026-07", savedManwon: 80, current: false },
          { yearMonth: "2026-08", savedManwon: 67, current: true },
        ],
      }),
    }),
  );

  await page.route("**/api/missions", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        missions: [
          {
            id: "active-1",
            source: "RECOMMENDED",
            category: "MEAL",
            title: "이번 주 배달음식 2회 이하로 주문",
            targetCount: 2,
            targetUnit: "TIMES_PER_WEEK",
            estimatedSavingsWon: 5000,
            savingsEstimateVersion: "V1",
            savingsLabel: "약 5,000원 절약 예상",
            status: "ACTIVE",
            weekEndsAt: "2099-01-01T00:00:00Z",
          },
          {
            id: "completed-1",
            source: "MANUAL",
            category: "LIVING",
            title: "사용하지 않는 구독 정리하기",
            status: "COMPLETED",
            weekEndsAt: "2099-01-01T00:00:00Z",
          },
        ],
      }),
    }),
  );

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "홈" })).toBeVisible();
  await expect(page.getByRole("link", { name: /5,000만원 모으기/ })).toBeVisible();

  const pigboxGauge = page.locator('[data-pigbox-progress="50"]');
  await expect(pigboxGauge).toBeVisible();
  await expect(pigboxGauge.locator("svg")).toHaveCount(3);
  await expect
    .poll(() =>
      pigboxGauge.evaluate((element) =>
        getComputedStyle(element).getPropertyValue("--pigbox-fill-top").trim(),
      ),
    )
    .toBe("63.5%");
});

test("onboarding status redirects to the allowed route", async ({ page }) => {
  await mockCurrentUser(page, false);

  await page.goto("/");

  await expect(page).toHaveURL("/onboarding/intro");
});
