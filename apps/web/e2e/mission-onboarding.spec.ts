import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ userId: 1, onboardingCompleted: true }),
    }),
  );
  await page.route("**/api/missions/catalog", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        categories: [
          {
            category: "MEAL",
            items: [
              { code: "DELIVERY_FOOD", label: "배달음식" },
              { code: "DINING_OUT", label: "외식" },
            ],
          },
        ],
      }),
    }),
  );
});

test("카테고리 인트로에서 다음을 눌러 입력을 완료하고 미션 생성을 시작한다", async ({ page }) => {
  let generationRequest: unknown;
  await page.route("**/api/missions/generation-jobs", async (route) => {
    generationRequest = route.request().postDataJSON();
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      body: JSON.stringify({
        jobId: "job-1",
        status: "PENDING",
        failureCode: null,
        generationSource: null,
        draftsAvailable: false,
        expiresAt: null,
        confirmed: false,
        pollingIntervalMillis: 2000,
      }),
    });
  });

  await page.goto("/mission/new/form?category=식비");
  await page.getByRole("button", { name: "다음" }).click();

  const itemQuestion = page.getByRole("heading", {
    name: "식비 중 줄이고 싶은 항목이 무엇인가요?",
  });
  await expect(itemQuestion).toBeFocused();
  await page.getByRole("button", { name: "배달음식" }).click();
  await page.getByRole("button", { name: "다음" }).click();
  await page.getByLabel("주간 소비 횟수").fill("3");
  await page.getByRole("button", { name: "다음" }).click();
  await page.getByLabel("주간 소비 금액(만원)").fill("5");
  await page.getByRole("button", { name: "다음" }).click();

  await expect(page).toHaveURL("/mission/new/generating?jobId=job-1");
  expect(generationRequest).toEqual({
    category: "MEAL",
    item: "DELIVERY_FOOD",
    baselineFrequency: 3,
    baselineAmountWon: 50_000,
  });
});
