import { test, expect } from "@playwright/test";
import { UserManagementPage } from "../pages/UserManagementPage";
import { LoginPage } from "../pages/LoginPage";
import { CREDENTIALS } from "../data/credentials";

const ROLES = [
  "Data editor",
  "Data user",
  "Municipal admin",
  "Municipal editor",
  "Municipal viewer",
  "Super admin",
];

test.describe("User Creation - All Roles", () => {
  let userPage: UserManagementPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    userPage = new UserManagementPage(page);

    await loginPage.goto();
    await loginPage.login(CREDENTIALS.valid.email, CREDENTIALS.valid.password);

    await userPage.goto();
  });

  for (const role of ROLES) {
    test(`Create user with role: ${role}`, async () => {
      const rand = Date.now();

      const user = {
        name: `Auto ${role} ${rand}`,
        email: `${role
          .toLowerCase()
          .replace(/\s+/g, "_")}_${rand}@mailinator.com`,
        designation: "Automation Tester",
        role,
      };

      await userPage.clickAddUser();
      await userPage.fillUserForm(user);
      await userPage.submit();

      // ✅ Success validation
      const toast = userPage.page.getByText(/user added successfully/i);
      await expect(toast).toBeVisible({ timeout: 10000 });

      // ✅ Optional table validation
      // await expect(userPage.page.getByText(user.email)).toBeVisible();
    });
  }
});
