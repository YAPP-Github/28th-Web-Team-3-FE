import { expect, test } from "@playwright/test";

test("home page renders", async ({ page }) => {
  await page.route("**/api/auth/guest", (route) =>
    route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ accessToken: "e2e-access-token", refreshToken: "e2e-refresh-token" }),
    }),
  );
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

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "홈" })).toBeVisible();
  await expect(page.getByRole("link", { name: /5,000만원 모으기/ })).toBeVisible();
});
