import { test } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { CREDENTIALS } from "../../data/credentials";

test("Generate storage state", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(CREDENTIALS.valid.email, CREDENTIALS.valid.password);

  // Save session state
  await page.context().storageState({ path: "storageState.json" });
});
