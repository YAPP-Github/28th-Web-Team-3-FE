import { expect, test } from "./fixtures";

const runningJob = {
  jobId: "job-1",
  status: "RUNNING",
  draftsAvailable: false,
  confirmed: false,
  expiresAt: null,
  failureCode: null,
  generationSource: null,
  pollingIntervalMillis: 1000,
};

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({
      json: { userId: 1, onboardingCompleted: true },
    }),
  );
});

test("생성 중 둘러보기 버튼과 안내를 표시한다", async ({ page }, testInfo) => {
  await page.route("**/api/missions/generation-jobs/job-1", (route) =>
    route.fulfill({ json: runningJob }),
  );
  await page.goto("/mission/new/loading?jobId=job-1");
  await expect(page.getByRole("button", { name: "다른 화면 둘러보기" })).toBeVisible();
  await expect(page.getByText("맞춤 미션을 만들고 있어요.", { exact: false })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("loading.png") });
});

test("조회 오류에서 다시 확인하면 결과로 이동한다", async ({ page }, testInfo) => {
  let available = false;
  await page.route("**/api/missions/generation-jobs/job-1", (route) =>
    available
      ? route.fulfill({ json: { ...runningJob, status: "SUCCEEDED", draftsAvailable: true } })
      : route.abort("failed"),
  );
  await page.route("**/api/missions/generation-jobs/job-1/drafts", (route) =>
    route.fulfill({
      json: { jobId: "job-1", categories: [] },
    }),
  );
  await page.goto("/mission/new/loading?jobId=job-1");
  await expect(page.getByText("진행 상태를 확인하지 못했어요.")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("network-error.png") });
  available = true;
  await page.getByRole("button", { name: "다시 확인하기" }).click();
  await expect(page).toHaveURL("/mission/new/result?jobId=job-1");
});

test("실패한 작업을 정리하고 새 설문을 시작한다", async ({ page }, testInfo) => {
  await page.addInitScript(() =>
    localStorage.setItem("mission-generation:pending", JSON.stringify({ jobId: "job-1" })),
  );
  await page.route("**/api/missions/generation-jobs/job-1", (route) =>
    route.fulfill({ json: { ...runningJob, status: "FAILED" } }),
  );
  await page.route("**/api/missions/catalog", (route) =>
    route.fulfill({ json: { categories: [] } }),
  );
  await page.goto("/mission/new/loading?jobId=job-1");
  await expect(page.getByText("미션 생성에 실패했어요.")).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("generation-failed.png"),
  });
  await page.getByRole("button", { name: "다시 생성하기" }).click();
  await expect(page).toHaveURL("/mission/new");
  expect(await page.evaluate(() => localStorage.getItem("mission-generation:pending"))).toBeNull();
});
