import { expect, type Page, test } from "@playwright/test";

async function mockCurrentUser(page: Page) {
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({
      body: JSON.stringify({ onboardingCompleted: true, userId: 1 }),
      contentType: "application/json",
      status: 200,
    }),
  );
}

function currentSeoulYearMonth() {
  const parts = new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    timeZone: "Asia/Seoul",
    year: "numeric",
  }).formatToParts(new Date());

  return {
    month: Number(parts.find(({ type }) => type === "month")?.value),
    year: Number(parts.find(({ type }) => type === "year")?.value),
  };
}

test("mission history renders current progress and blocks future months", async ({ page }) => {
  const { month, year } = currentSeoulYearMonth();
  await page.setViewportSize({ height: 812, width: 375 });
  await mockCurrentUser(page);
  await page.route("**/api/missions/progress", (route) =>
    route.fulfill({
      body: JSON.stringify({
        completedCount: 1,
        progressPercent: 25,
        totalCount: 4,
        weekStartDate: `${year}-${String(month).padStart(2, "0")}-10`,
      }),
      contentType: "application/json",
      status: 200,
    }),
  );

  await page.goto("/mission/history");

  await expect(page.getByRole("heading", { name: "내역" })).toBeVisible();
  await expect(page.getByText(`${year}년 ${month}월`)).toBeVisible();
  await expect(page.getByText("25% 달성")).toBeVisible();
  await expect(page.getByText("현재 진행 중")).toBeVisible();
  await expect(page.getByRole("button", { name: "다음 달" })).toBeDisabled();

  const pig = page.getByRole("button", { name: /저금통 애니메이션 재생/ });
  await expect(pig.locator("svg")).toHaveCount(3);
  await pig.click();

  await page.getByRole("button", { name: "이전 달" }).click();
  await expect(page.getByText("아직 기록된 미션 내역이 없어요.")).toBeVisible();
  await expect(page.getByRole("button", { name: "다음 달" })).toBeEnabled();
});
