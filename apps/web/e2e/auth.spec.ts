import { expect, test } from "@playwright/test";

/**
 * End-to-end auth check. Signs a user up via the Better Auth API, then logs in
 * through the UI and asserts a session cookie is set — exercising the full
 * schema -> form -> Better Auth -> Drizzle path.
 */
test("user can sign up via API then log in via UI", async ({ page, request }) => {
  const email = `e2e_${Date.now()}@example.com`;
  const password = "supersecret";

  const signup = await request.post("/api/auth/sign-up/email", {
    data: { name: "E2E User", email, password },
  });
  expect(signup.ok()).toBeTruthy();

  await page.goto("/login");
  await page.getByPlaceholder("이메일").fill(email);
  await page.getByPlaceholder("비밀번호").fill(password);
  await page.getByRole("button", { name: "로그인" }).click();

  await page.waitForURL("/");

  const cookies = await page.context().cookies();
  expect(cookies.some((c) => c.name.includes("session_token"))).toBeTruthy();
});
