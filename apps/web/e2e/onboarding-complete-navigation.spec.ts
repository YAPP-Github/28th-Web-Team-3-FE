import { expect, test } from "@playwright/test";

const goalPlans = {
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
};

test("온보딩 목표 확정 후 Hook 오류 없이 홈으로 이동한다", async ({ page }) => {
  const pageErrors: string[] = [];
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
        monthlySalaryManwon: 300,
        monthlySavingManwon: 100,
        netWorthManwon: 1000,
        goalPeriodMonths: 12,
      }),
    }),
  );
  await page.route("**/api/onboarding/goal-plans", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(goalPlans),
    }),
  );
  await page.route("**/api/onboarding/goal", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        goalId: 1,
        plan: "PLAN_1",
        periodMonths: 12,
        targetAmountManwon: 1968,
        status: "COMPLETED",
      }),
    }),
  );

  await page.goto("/onboarding/goal");
  await page.getByRole("button", { name: "이 목표로 시작" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: "홈" })).toBeVisible();
  expect(pageErrors).toEqual([]);
});
