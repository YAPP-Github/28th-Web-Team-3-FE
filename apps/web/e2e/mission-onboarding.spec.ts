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

test("채팅 질문에 답하고 미션 생성을 시작한다", async ({ page }) => {
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

  await page.goto("/mission/new");
  await page.getByRole("button", { name: "식비" }).click();
  await expect(page.getByRole("status", { name: "다음 질문을 준비하고 있어요" })).toBeVisible();
  await page.getByRole("button", { name: "배달음식" }).click();
  await page.getByRole("button", { name: "3회" }).click();
  await page.getByLabel("평소 소비 금액").fill("50000");
  await page.getByRole("button", { name: "답변 보내기" }).click();
  await page.getByRole("button", { name: "미션 추천 받기" }).click();

  await expect(page).toHaveURL("/mission/new/loading?jobId=job-1");
  expect(generationRequest).toEqual({
    category: "MEAL",
    item: "DELIVERY_FOOD",
    baselineFrequency: 3,
    baselineAmountWon: 50_000,
  });
});
