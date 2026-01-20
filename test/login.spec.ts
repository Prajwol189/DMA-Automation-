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
    // Listen for the login API response
    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" && response.status() !== 200,
    );

    await loginPage.login(
      CREDENTIALS.valid.email,
      CREDENTIALS.invalid.wrongPassword,
    );

    // Safer check: Verify we are still on the login page
    await expect(page).toHaveURL(/.*login/);
  });

  test("Invalid Login - Wrong Email", async ({ page }) => {
    await loginPage.login(
      CREDENTIALS.invalid.wrongEmail,
      CREDENTIALS.valid.password,
    );
    await expect(page).toHaveURL(/.*login/);
  });
});
