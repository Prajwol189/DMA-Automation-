import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { CREDENTIALS } from "../data/credentials";

test.describe("Login Functionality", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("Valid Login", async ({ page }) => {
    await loginPage.login(CREDENTIALS.valid.email, CREDENTIALS.valid.password);
    // Verify successful login by checking URL change or dashboard element
    await expect(page).not.toHaveURL(/.*login/, { timeout: 10000 });
    await expect(page.getByText(/dashboard/i)).toBeVisible({ timeout: 10000 });
  });

  test("Invalid Login - Wrong Password", async ({ page }) => {
    const [response] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes("/api/v1/user/sign-in/") &&
          res.request().method() === "POST" &&
          res.status() === 401,
      ),
      loginPage.login(
        CREDENTIALS.valid.email,
        CREDENTIALS.invalid.wrongPassword,
      ),
    ]);

    const responseBody = await response.json();

    // 🔍 Flexible validation (handles dynamic messages)
    expect(responseBody.detail).toMatch(/invalid|incorrect password/i);

    // 🔍 UI validation
    await expect(page).toHaveURL(/login/);
    await expect(page.getByText(/invalid password|incorrect/i)).toBeVisible();
  });

  test("Invalid Login - Wrong Email", async ({ page }) => {
    await loginPage.login(
      CREDENTIALS.invalid.wrongEmail,
      CREDENTIALS.valid.password,
    );
    await expect(page).toHaveURL(/.*login/);
  });
});
