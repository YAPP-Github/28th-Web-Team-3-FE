import { expect, test } from "./fixtures";

// 인증은 네이티브 셸(bridge) 몫이라 브라우저 e2e에는 토큰이 없다. 화면이 뜨는 데 필요한
// 응답만 목으로 세운다.
test.beforeEach(async ({ page }) => {
  // 온보딩 상태 라우팅이 이 응답을 보고 미완료면 온보딩으로 되돌려 보낸다.
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ userId: 1, onboardingCompleted: true }),
    }),
  );

  await page.route("**/api/missions", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        missions: [
          {
            id: "meal-1",
            source: "RECOMMENDED",
            category: "MEAL",
            title: "이번 주 배달음식 2회 이하로 주문",
            targetCount: 2,
            targetUnit: "TIMES_PER_WEEK",
            estimatedSavingsWon: 5000,
            savingsEstimateVersion: "V1",
            savingsLabel: "약 5,000원 절약 예상",
            status: "ACTIVE",
            weekEndsAt: "2099-01-01T00:00:00Z",
          },
        ],
      }),
    }),
  );
});

// div에 aria-modal만 붙이면 스크린리더에는 모달이라고 알려놓고 초점은 뒤 화면으로 새어
// 나간다. 실제 Tab 이동이 다이얼로그 안에 갇히는지는 브라우저에서만 확인된다.
test("완료 다이얼로그가 초점을 가둔다", async ({ page }) => {
  await page.goto("/mission");
  await page.getByRole("button", { name: "미션 완료" }).click();

  const dialog = page.getByRole("dialog", { name: "미션을 완료할까요?" });
  await expect(dialog).toBeVisible();

  // 초점이 열어준 버튼에 남아 있으면 안 된다.
  await expect(dialog.getByRole("button", { name: "취소" })).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("button", { name: "완료" })).toBeFocused();

  // 마지막 요소에서 한 번 더 누르면 뒤 화면이 아니라 첫 요소로 돌아온다.
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("button", { name: "취소" })).toBeFocused();
});

test("Escape로 닫으면 열어준 버튼으로 초점이 돌아온다", async ({ page }) => {
  await page.goto("/mission");
  const completeButton = page.getByRole("button", { name: "미션 완료" });
  await completeButton.click();

  const dialog = page.getByRole("dialog", { name: "미션을 완료할까요?" });
  await expect(dialog).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  // 초점이 문서 처음으로 튀면 사용자는 목록 위치를 잃는다.
  await expect(completeButton).toBeFocused();
});
