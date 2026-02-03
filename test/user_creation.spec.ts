import { test, expect } from "@playwright/test";
import { UserManagementPage } from "../pages/UserManagementPage";
import { activateUserViaMailinator } from "../utils/mailinator";

const ROLES = [
  "Data editor",
  "Data user",
  "Municipal admin",
  "Municipal editor",
  "Municipal viewer",
  "Super admin",
];

test.describe("User Creation + Activation - All Roles", () => {
  test.describe.configure({ mode: "serial" });

  let userPage: UserManagementPage;

  test.beforeEach(async ({ page }) => {
    userPage = new UserManagementPage(page);
    await page.goto("/user-management");
  });

  for (const role of ROLES) {
    test(`Create & activate user: ${role}`, async ({ page }) => {
      const rand = Date.now();

      const email = `${role
        .toLowerCase()
        .replace(/\s+/g, "_")}_${rand}@mailinator.com`;

      const inbox = email.split("@")[0];
      const password = "Pr@123rty";

      const user = {
        name: `Auto ${role} ${rand}`,
        email,
        designation: "Automation Tester",
        role,
      };

      // Create user
      await userPage.clickAddUser();
      await userPage.fillUserForm(user);
      await userPage.submit();

      await expect(page.getByText(/user added successfully/i)).toBeVisible({
        timeout: 10000,
      });

      // Activate + logout + login
      await activateUserViaMailinator(page, inbox, email, password);
    });
  }
});
