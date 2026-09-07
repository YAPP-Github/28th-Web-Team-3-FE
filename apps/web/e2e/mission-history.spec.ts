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

test("mission history renders monthly weekly completion and blocks future months", async ({
  page,
}) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "numeric",
    timeZone: "Asia/Seoul",
    year: "numeric",
  }).formatToParts(new Date());
  const year = Number(parts.find(({ type }) => type === "year")?.value);
  const month = Number(parts.find(({ type }) => type === "month")?.value);
  const day = Number(parts.find(({ type }) => type === "day")?.value);
  // 브라우저 시계는 유지하고 목 데이터만 과거·현재 구간으로 만들어 미래 주차 필터를 피한다.
  const dateAtOffset = (offset: number) =>
    new Date(Date.UTC(year, month - 1, day + offset)).toISOString().slice(0, 10);
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.setViewportSize({ height: 812, width: 375 });
  await mockCurrentUser(page);
  await page.route(/\/api\/missions\/histories\?.*/, (route) =>
    route.fulfill({
      body: JSON.stringify({
        histories: [
          {
            completedCount: 0,
            isCurrentWeek: false,
            totalCount: 0,
            weekEndDate: dateAtOffset(-4),
            weekOfMonth: 2,
            weekStartDate: dateAtOffset(-10),
          },
          {
            completedCount: 1,
            isCurrentWeek: true,
            totalCount: 4,
            weekEndDate: dateAtOffset(3),
            weekOfMonth: 3,
            weekStartDate: dateAtOffset(-3),
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
  expect(pageErrors).toEqual([]);
});
