import { expect, type Page, test } from "@playwright/test";

async function mockCurrentUser(page: Page, onboardingCompleted: boolean | (() => boolean)) {
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        userId: 1,
        onboardingCompleted:
          typeof onboardingCompleted === "function" ? onboardingCompleted() : onboardingCompleted,
      }),
    }),
  );
}

async function mockHomeGoal(page: Page) {
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
}

async function mockOnboardingProfile(page: Page) {
  await page.route("**/api/onboarding/profile", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "IN_PROGRESS",
        birthDate: null,
        monthlySalaryManwon: null,
        monthlySavingManwon: null,
        netWorthManwon: null,
        goalPeriodMonths: null,
      }),
    }),
  );
}

async function mockOnboardingReport(page: Page) {
  const series = {
    bins: [{ lowerManwon: 0, upperManwon: null, ratio: 0.1, density: 0.2 }],
    markerManwon: 300,
  };
  await page.route("**/api/onboarding/report", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        simulation: {
          baselineManwon: 100,
          simulationManwon: 115,
          diffManwon: 15,
          upliftPercent: 15,
          periodMonths: 24,
        },
        peer: { assetRatioPercent: 36, incomeTopPercent: 40, consumptionTopPercent: 50 },
        histogram: { income: series, consumption: series },
        diagnosis: { branchCode: 1, message: "진단 메시지" },
        disclaimer: "disclaimer",
        datasetVersion: "dataset-v1",
        configVersion: "config-v1",
      }),
    }),
  );
}

async function mockOnboardingGoalPlans(page: Page) {
  await page.route("**/api/onboarding/goal-plans", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        monthlySavingManwon: 100,
        periodMonths: 12,
        plans: [
          {
            plan: "PLAN_1",
            label: "확실하게",
            default: true,
            increaseMinManwon: 180,
            increaseMaxManwon: 360,
            checkpoints: [
              { month: 3, amountManwon: 246 },
              { month: 6, amountManwon: 492 },
              { month: 9, amountManwon: 984 },
              { month: 12, amountManwon: 1968 },
            ],
            card: { month: 12, amountManwon: 1968 },
          },
        ],
      }),
    }),
  );
}

/** 목표 확정 응답. 확정되면 `onComplete`로 /api/auth/me 목의 완료 상태를 뒤집는다. */
async function mockOnboardingGoalConfirm(page: Page, onComplete: () => void) {
  await page.route("**/api/onboarding/goal", (route) => {
    onComplete();
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        goalId: 1,
        plan: "PLAN_1",
        periodMonths: 12,
        targetAmountManwon: 1968,
        status: "COMPLETED",
      }),
    });
  });
}

// 인증은 네이티브 셸(bridge) 몫이라 브라우저 e2e에는 토큰이 없다.
// API 응답을 목으로 세워 화면 렌더만 검증한다.
test("home page renders", async ({ page }) => {
  await mockCurrentUser(page, true);
  await mockHomeGoal(page);

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "홈" })).toBeVisible();
  await expect(page.getByRole("link", { name: /5,000만원 모으기/ })).toBeVisible();
});

test("onboarding status redirects to the allowed route", async ({ page }) => {
  await mockCurrentUser(page, false);

  await page.goto("/");

  await expect(page).toHaveURL("/onboarding/intro");
});

test("온보딩 완료 후 홈 이동은 히스토리를 남기지 않는다", async ({ page }) => {
  let onboardingCompleted = false;
  await mockCurrentUser(page, () => onboardingCompleted);
  await mockHomeGoal(page);
  await mockOnboardingProfile(page);
  await mockOnboardingGoalPlans(page);
  await mockOnboardingGoalConfirm(page, () => {
    onboardingCompleted = true;
  });

  await page.goto("/onboarding/goal");
  await expect(page.getByRole("heading", { name: /2가지 목표금액을/ })).toBeVisible();
  const historyLength = await page.evaluate(() => window.history.length);

  await page.getByRole("button", { name: "이 목표로 시작" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: "홈" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.history.length)).toBe(historyLength);
});

/**
 * 위 테스트는 마지막 이동이 `replace`라는 것만 보이고, 뒤로 갔을 때 사용자가 어디에
 * 도착하는지는 말해주지 않는다. 온보딩 중간 단계는 의도적으로 `push`라(단계 간 뒤로가기를
 * 허용하려고) 완료 후 뒤로 가면 실제로 온보딩 URL에 도달한다 — 거기서 `OnboardingRouteGuard`가
 * 완료 사용자를 홈으로 되돌리는지가 이 시나리오의 실제 검증 대상이다.
 */
test("온보딩 완료 후 뒤로 가도 온보딩 화면으로 돌아가지 않는다", async ({ page }) => {
  let onboardingCompleted = false;
  await mockCurrentUser(page, () => onboardingCompleted);
  await mockHomeGoal(page);
  await mockOnboardingProfile(page);
  await mockOnboardingReport(page);
  await mockOnboardingGoalPlans(page);
  await mockOnboardingGoalConfirm(page, () => {
    onboardingCompleted = true;
  });

  // result -> goal은 push다. 이 단계를 거쳐야 뒤로 갈 온보딩 히스토리가 실제로 쌓인다.
  await page.goto("/onboarding/result");
  await page.getByRole("button", { name: "목표금액 설정하기" }).click();
  await expect(page).toHaveURL("/onboarding/goal");

  await page.getByRole("button", { name: "이 목표로 시작" }).click();
  await expect(page).toHaveURL("/");

  await page.goBack();

  // 뒤로가기는 /onboarding/result에 닿지만 가드가 곧바로 홈으로 replace한다.
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: "홈" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "나는 잘하고 있을까?" })).toBeHidden();
});
