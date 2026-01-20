import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { CREDENTIALS } from "../data/credentials";
import { time } from "console";
import { TIMEOUT } from "dns";

test.describe("Login Functionality", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // ---------------------------
  // POSITIVE TEST CASE
  // ---------------------------
  test("Valid Login", async ({ page }) => {
    await loginPage.login(CREDENTIALS.valid.email, CREDENTIALS.valid.password);

    await expect(page).not.toHaveURL(/.*login/, { timeout: 10000 });
    await expect(page.getByText(/dashboard/i)).toBeVisible({ timeout: 10000 });
  });

  // ---------------------------
  // NEGATIVE TEST CASES
  // ---------------------------
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

  // ---------------------------
  // EMPTY FIELD VALIDATION
  // ---------------------------
  test("Login with empty email and password", async ({ page }) => {
    await loginPage.login("", "");
    await expect(page).toHaveURL(/.*login/);
  });

  test("Login with empty email", async ({ page }) => {
    await loginPage.login("", CREDENTIALS.valid.password);
    await expect(page).toHaveURL(/.*login/);
  });

  test("Login with empty password", async ({ page }) => {
    await loginPage.login(CREDENTIALS.valid.email, "");
    await expect(page).toHaveURL(/.*login/);
  });

  // ---------------------------
  // EMAIL FORMAT VALIDATION
  // ---------------------------
  test("Login with invalid email format", async ({ page }) => {
    await loginPage.login("invalid-email", "password123");
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByText("पासवर्ड", { exact: true })).toBeVisible();
  });

  test("Login with email missing domain", async ({ page }) => {
    await loginPage.login("user@", "password123");
    await expect(page).toHaveURL(/.*login/);
  });

  // ---------------------------
  // BOUNDARY / LENGTH TESTS
  // ---------------------------
  test("Login with very long email and password", async ({ page }) => {
    const longEmail = "a".repeat(256) + "@test.com";
    const longPassword = "p".repeat(300);

    await loginPage.login(longEmail, longPassword);
    await expect(page).toHaveURL(/.*login/);
  });

  test("Login with very short password", async ({ page }) => {
    await loginPage.login(CREDENTIALS.valid.email, "1");
    await expect(page).toHaveURL(/.*login/);
  });

  // ---------------------------
  // SECURITY TESTS
  // ---------------------------
  test("Login with SQL injection attempt", async ({ page }) => {
    await loginPage.login("' OR 1=1 --", "' OR 1=1 --");
    await expect(page).toHaveURL(/.*login/);
  });

  test("Login with XSS attempt", async ({ page }) => {
    await loginPage.login(
      "<script>alert(1)</script>",
      "<script>alert(1)</script>",
    );
    await expect(page).toHaveURL(/.*login/);
  });

  // ---------------------------
  // UI BEHAVIOR TESTS
  // ---------------------------
  test("Password field should be masked", async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toHaveAttribute("type", "password");
  });
  // ---------------------------
  // MULTIPLE ATTEMPTS / STABILITY
  // ---------------------------
  test("Multiple failed login attempts do not crash the app", async ({
    page,
  }) => {
    for (let i = 0; i < 9; i++) {
      await loginPage.login(
        CREDENTIALS.valid.email,
        CREDENTIALS.invalid.wrongPassword,
      );
      await expect(page).toHaveURL(/.*login/);
    }
  });

  // ---------------------------
  // SESSION HANDLING
  // ---------------------------
  test("User remains logged in after page reload", async ({ page }) => {
    await loginPage.login(CREDENTIALS.valid.email, CREDENTIALS.valid.password);

    // Wait until login redirects
    await page.waitForURL(/dashboard/, { timeout: 10000 });

    await page.reload();

    await expect(page).not.toHaveURL(/login/);
  });
});
