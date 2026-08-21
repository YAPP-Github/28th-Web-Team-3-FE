import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 375, height: 812 } });

test("이번 달 툴팁을 화면 안에 유지한다", async ({ page }) => {
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ userId: 1, onboardingCompleted: true }),
    }),
  );
  await page.route("**/api/v2/goal", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        targetAmountManwon: 5_000,
        periodMonths: 16,
        totalSavedManwon: 1_950,
        progressPercent: 39,
        usageMonths: 8,
        deadlineDDay: 240,
        thisMonth: { targetManwon: 190, savedManwon: 100, progressPercent: 53, dDay: 12 },
        monthlySavings: Array.from({ length: 12 }, (_, index) => ({
          yearMonth: `${index < 4 ? 2025 : 2026}-${String(index < 4 ? index + 9 : index - 3).padStart(2, "0")}`,
          savedManwon: 50 + index * 5,
          current: index === 11,
        })),
      }),
    }),
  );

  await page.goto("/goal");

  const viewport = page.getByRole("region", { name: "월별 저축 현황" });
  const tooltip = viewport.getByText("목표: 190만원").locator("..");
  const currentMonthBar = viewport.locator("[data-current-month-bar]");
  await expect(tooltip).toBeVisible();

  const [viewportBox, tooltipBox, currentMonthBarBox] = await Promise.all([
    viewport.boundingBox(),
    tooltip.boundingBox(),
    currentMonthBar.boundingBox(),
  ]);
  expect(viewportBox).not.toBeNull();
  expect(tooltipBox).not.toBeNull();
  expect(currentMonthBarBox).not.toBeNull();
  expect(tooltipBox?.x).toBeGreaterThanOrEqual(viewportBox?.x ?? 0);
  expect((tooltipBox?.x ?? 0) + (tooltipBox?.width ?? 0)).toBeLessThanOrEqual(
    (viewportBox?.x ?? 0) + (viewportBox?.width ?? 0),
  );
  expect(
    (currentMonthBarBox?.y ?? 0) - ((tooltipBox?.y ?? 0) + (tooltipBox?.height ?? 0)),
  ).toBeGreaterThanOrEqual(10);
});
