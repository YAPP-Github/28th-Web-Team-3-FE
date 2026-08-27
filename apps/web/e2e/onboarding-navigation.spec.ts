import { expect, test } from "./fixtures";

test("온보딩에서 뒤로 이동하거나 이탈 후 재진입해도 마지막 저장 응답을 복원한다", async ({
  page,
}) => {
  const profile = {
    status: "IN_PROGRESS",
    birthDate: null as string | null,
    // prod BE는 주소를 보내지 않는 기존 FE를 위해 임시 SEOUL을 유지한다.
    address: "SEOUL" as string | null,
    monthlySalaryManwon: null,
    monthlySavingManwon: null,
    netWorthManwon: null,
    goalPeriodMonths: null,
  };

  await page.route("**/api/auth/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ userId: 1, onboardingCompleted: false }),
    }),
  );
  await page.route("**/api/onboarding/profile", async (route) => {
    if (route.request().method() === "PATCH") {
      Object.assign(profile, route.request().postDataJSON());
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(profile),
    });
  });

  await page.goto("/onboarding/age");
  await page.getByRole("textbox", { name: "생년월일" }).fill("19980301");
  await page.getByRole("button", { name: "다음" }).click();
  await expect(page).toHaveURL("/onboarding/address");
  await expect(page.getByRole("radio", { name: "서울" })).not.toBeChecked();
  await expect(page.getByRole("button", { name: "다음" })).toBeDisabled();

  await page.getByRole("button", { name: "이전", exact: true }).click();
  await expect(page).toHaveURL("/onboarding/age");
  await page.goBack();
  await expect(page).toHaveURL("/onboarding/age");
  await page.goto("/onboarding/address");

  await page.getByRole("radio", { name: "경기" }).click();
  await page.getByRole("button", { name: "다음" }).click();
  await expect(page).toHaveURL("/onboarding/month");

  await page.getByRole("button", { name: "이전 단계" }).click();
  await expect(page).toHaveURL("/onboarding/address");
  await expect(page.getByRole("radio", { name: "경기" })).toBeChecked();

  // 다음을 누르지 않은 현재 화면의 draft는 서버 저장값을 덮지 않아야 한다.
  await page.getByRole("radio", { name: "제주" }).click();
  await page.goto("/");
  await expect(page).toHaveURL("/onboarding/intro");
  await page.getByRole("link", { name: "시작" }).click();
  await page.getByRole("button", { name: "다음" }).click();

  await expect(page).toHaveURL("/onboarding/address");
  await expect(page.getByRole("radio", { name: "경기" })).toBeChecked();
  await expect(page.getByRole("radio", { name: "제주" })).not.toBeChecked();
});
