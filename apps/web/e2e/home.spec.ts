import { expect, type Page, test } from "@playwright/test";

async function mockCurrentUser(page: Page, onboardingCompleted: boolean | (() => boolean)) {
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        userId: 1,
        onboardingCompleted:
          typeof onboardingCompleted === "function" ? onboardingCompleted() : onboardingCompleted,
      }),
    }),
  );
}

async function mockHomeGoal(page: Page) {
  await page.route("**/api/goal", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        targetAmountManwon: 5_000,
        totalSavedManwon: 1_950,
        progressPercent: 100,
        usageMonths: 8,
        deadlineDDay: 486,
        thisMonth: { targetManwon: 82, savedManwon: 67, progressPercent: 82, dDay: 12 },
      }),
    }),
  );
}

async function mockOnboardingProfile(page: Page) {
  await page.route("**/api/onboarding/profile", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "IN_PROGRESS",
        birthDate: null,
        monthlySalaryManwon: null,
        monthlySavingManwon: null,
        netWorthManwon: null,
        goalPeriodMonths: null,
      }),
    }),
  );
}

// 인증은 네이티브 셸(bridge) 몫이라 브라우저 e2e에는 토큰이 없다.
// API 응답을 목으로 세워 화면 렌더만 검증한다.
test("home page renders", async ({ page }) => {
  await mockCurrentUser(page, true);
  await mockHomeGoal(page);

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "홈" })).toBeVisible();
  await expect(page.getByRole("link", { name: /5,000만원 모으기/ })).toBeVisible();
});

test("onboarding status redirects to the allowed route", async ({ page }) => {
  await mockCurrentUser(page, false);

  await page.goto("/");

  await expect(page).toHaveURL("/onboarding/intro");
});

test("온보딩 완료 후 홈 이동은 히스토리를 남기지 않는다", async ({ page }) => {
  let onboardingCompleted = false;
  await mockCurrentUser(page, () => onboardingCompleted);
  await mockHomeGoal(page);
  await mockOnboardingProfile(page);
  await page.route("**/api/onboarding/goal-plans", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        monthlySavingManwon: 100,
        periodMonths: 12,
        plans: [
          {
            plan: "PLAN_1",
            label: "확실하게",
            default: true,
            increaseMinManwon: 180,
            increaseMaxManwon: 360,
            checkpoints: [
              { month: 3, amountManwon: 246 },
              { month: 6, amountManwon: 492 },
              { month: 9, amountManwon: 984 },
              { month: 12, amountManwon: 1968 },
            ],
            card: { month: 12, amountManwon: 1968 },
          },
        ],
      }),
    }),
  );
  await page.route("**/api/onboarding/goal", (route) => {
    onboardingCompleted = true;
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        goalId: 1,
        plan: "PLAN_1",
        periodMonths: 12,
        targetAmountManwon: 1968,
        status: "COMPLETED",
      }),
    });
  });

  await page.goto("/onboarding/goal");
  await expect(page.getByRole("heading", { name: /2가지 목표금액을/ })).toBeVisible();
  const historyLength = await page.evaluate(() => window.history.length);

  await page.getByRole("button", { name: "이 목표로 시작" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: "홈" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.history.length)).toBe(historyLength);
});
