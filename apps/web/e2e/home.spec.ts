import { expect, test } from "@playwright/test";

// 인증은 네이티브 셸(bridge) 몫이라 브라우저 e2e에는 토큰이 없다.
// API 응답을 목으로 세워 화면 렌더만 검증한다.
test("home page renders", async ({ page }) => {
  await page.route("**/api/onboarding/profile", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "COMPLETED",
        birthDate: "1999-01-01",
        monthlySalaryManwon: 300,
        monthlySavingManwon: 100,
        netWorthManwon: 1_000,
        goalPeriodMonths: 12,
      }),
    }),
  );

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

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "홈" })).toBeVisible();
  await expect(page.getByRole("link", { name: /5,000만원 모으기/ })).toBeVisible();
});
