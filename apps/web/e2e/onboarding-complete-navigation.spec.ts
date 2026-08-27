import { expect, test } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("onboarding:address-confirmed:1", "true");
  });
});

test("온보딩 목표 확정 후 Hook 오류 없이 홈으로 이동한다", async ({ page }) => {
  const pageErrors: string[] = [];
  let confirmedGoal: unknown;
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.route("**/api/auth/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ userId: 1, onboardingCompleted: false }),
    }),
  );
  await page.route("**/api/onboarding/profile", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "IN_PROGRESS",
        birthDate: "2000-01-01",
        address: "SEOUL",
        monthlySalaryManwon: 300,
        monthlySavingManwon: 100,
        netWorthManwon: 1000,
        goalPeriodMonths: 12,
      }),
    }),
  );
  await page.route("**/api/v2/onboarding/goal-preview", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        monthlySavingManwon: 115,
        currentMonthlySavingManwon: 100,
        minMonthlySavingManwon: 100,
        maxMonthlySavingManwon: 150,
        recommendedMonthlySavingManwon: 115,
        periodMonths: 12,
        baseAmountManwon: 1000,
        additionalSavingManwon: 1380,
        expectedAmountManwon: 2380,
        extraMonthlyManwon: 15,
        extraPercent: 15,
      }),
    }),
  );
  await page.route("**/api/v2/onboarding/goal", async (route) => {
    confirmedGoal = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        goalId: 1,
        periodMonths: 12,
        targetAmountManwon: 2380,
        status: "COMPLETED",
      }),
    });
  });
  await page.route("**/api/v2/goal", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        targetAmountManwon: 2380,
        periodMonths: 12,
        totalSavedManwon: 1000,
        progressPercent: 42,
        usageMonths: 0,
        deadlineDDay: 365,
        thisMonth: { targetManwon: 115, savedManwon: 0, progressPercent: 0, dDay: 30 },
        monthlySavings: [],
      }),
    }),
  );
  await page.route("**/api/missions**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ missions: [] }),
    }),
  );
  await page.route("**/api/policies**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    }),
  );

  await page.goto("/onboarding/result");
  await page.getByRole("button", { name: "이 목표로 시작하기" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: "홈" })).toBeVisible();
  expect(confirmedGoal).toEqual({ monthlySavingManwon: 115 });
  expect(pageErrors).toEqual([]);
});

test("기존 목표 선택 URL은 새 결과 화면으로 이동한다", async ({ page }) => {
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ userId: 1, onboardingCompleted: false }),
    }),
  );
  await page.route("**/api/onboarding/profile", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "IN_PROGRESS",
        birthDate: "2000-01-01",
        address: "SEOUL",
        monthlySalaryManwon: 300,
        monthlySavingManwon: 100,
        netWorthManwon: 1000,
        goalPeriodMonths: 12,
      }),
    }),
  );
  await page.route("**/api/v2/onboarding/goal-preview", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        monthlySavingManwon: 115,
        currentMonthlySavingManwon: 100,
        minMonthlySavingManwon: 100,
        maxMonthlySavingManwon: 150,
        recommendedMonthlySavingManwon: 115,
        periodMonths: 12,
        baseAmountManwon: 1000,
        additionalSavingManwon: 1380,
        expectedAmountManwon: 2380,
        extraMonthlyManwon: 15,
        extraPercent: 15,
      }),
    }),
  );

  await page.goto("/onboarding/goal");

  await expect(page).toHaveURL("/onboarding/result");
  await expect(page.getByRole("heading", { name: "얼마를 목표로 할까요?" })).toBeVisible();
});
