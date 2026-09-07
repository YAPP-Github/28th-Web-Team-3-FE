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
  const today = new Date(Date.UTC(year, month - 1, day));
  const mondayOffset = -((today.getUTCDay() + 6) % 7);
  // 서울 날짜의 월요일~일요일을 사용하되 브라우저 시계는 변경하지 않는다.
  const dateAtOffset = (offset: number) =>
    new Date(Date.UTC(year, month - 1, day + mondayOffset + offset));
  const weekAtOffset = (offset: number) => {
    const start = dateAtOffset(offset);
    const end = dateAtOffset(offset + 6);
    const startsInSelectedMonth =
      start.getUTCFullYear() === year && start.getUTCMonth() === month - 1;
    return {
      weekEndDate: end.toISOString().slice(0, 10),
      weekOfMonth: Math.ceil(
        (startsInSelectedMonth ? start.getUTCDate() + 6 : end.getUTCDate()) / 7,
      ),
      weekStartDate: start.toISOString().slice(0, 10),
    };
  };
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
            ...weekAtOffset(-7),
          },
          {
            completedCount: 1,
            isCurrentWeek: true,
            totalCount: 4,
            ...weekAtOffset(0),
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
  const body = pig.locator("[data-pigbox-fill] svg > g > g").first();
  await expect(body).toHaveAttribute("transform", /matrix/);
  const restingTransform = await body.getAttribute("transform");
  await pig.click();
  // 재생 중 몸통 이동과 complete 리스너의 원위치 복귀까지 확인한다.
  await expect.poll(() => body.getAttribute("transform")).not.toBe(restingTransform);
  await expect.poll(() => body.getAttribute("transform")).toBe(restingTransform);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  expect(pageErrors).toEqual([]);
});
