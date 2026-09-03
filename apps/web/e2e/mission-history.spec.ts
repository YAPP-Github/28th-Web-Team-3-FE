import { expect, type Page, test } from "./fixtures";

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

test("mission history renders monthly weekly completion and blocks future months", async ({
  page,
}) => {
  const { month, year } = currentSeoulYearMonth();
  await page.setViewportSize({ height: 812, width: 375 });
  await page.clock.setFixedTime(
    new Date(`${year}-${String(month).padStart(2, "0")}-25T12:00:00+09:00`),
  );
  await mockCurrentUser(page);
  await page.route(/\/api\/missions\/histories\?.*/, (route) =>
    route.fulfill({
      body: JSON.stringify({
        histories: [
          {
            completedCount: 0,
            isCurrentWeek: false,
            totalCount: 0,
            weekEndDate: `${year}-${String(month).padStart(2, "0")}-16`,
            weekOfMonth: 2,
            weekStartDate: `${year}-${String(month).padStart(2, "0")}-10`,
          },
          {
            completedCount: 1,
            isCurrentWeek: true,
            totalCount: 4,
            weekEndDate: `${year}-${String(month).padStart(2, "0")}-23`,
            weekOfMonth: 3,
            weekStartDate: `${year}-${String(month).padStart(2, "0")}-17`,
          },
        ],
      }),
      contentType: "application/json",
      status: 200,
    }),
  );

  await page.goto("/mission/history");

  await expect(page.getByRole("heading", { name: "내역" })).toBeVisible();
  await expect(page.getByText(`${year}년 ${month}월`)).toBeVisible();
  await expect(page.getByText("25% 달성")).toBeVisible();
  await expect(page.getByText("생성된 미션이 없어요.")).toBeVisible();
  await expect(page.getByText("현재 진행 중")).toBeVisible();
  await expect(page.getByRole("button", { name: "다음 달" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "이전 달" })).toBeDisabled();

  const pig = page.getByRole("button", { name: /저금통 애니메이션 재생/ });
  await expect(pig).toHaveCount(1);
  await expect(pig.locator("svg")).toHaveCount(3);
  await pig.click();
});
