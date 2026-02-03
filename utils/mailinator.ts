import { Page, expect } from "@playwright/test";

export async function activateUserViaMailinator(
  page: Page,
  inbox: string,
  email: string,
  password: string,
) {
  // 1️⃣ Open Mailinator inbox
  await page.goto(
    `https://www.mailinator.com/v4/public/inboxes.jsp?to=${inbox}`,
  );

  // 2️⃣ Open latest activation email
  const emailRow = page
    .locator("tr")
    .filter({ hasText: "User Activation" })
    .first();
  await emailRow.waitFor({ timeout: 90000 });
  await emailRow.click();

  // 3️⃣ Open LINKS tab
  await page.getByRole("tab", { name: "LINKS" }).click();

  // 4️⃣ Click activation link and wait for popup
  const activationLink = page
    .locator('a[href*="/email-verification/"]')
    .first();
  const [popup] = await Promise.all([
    page.waitForEvent("popup"),
    activationLink.click(),
  ]);

  // 5️⃣ Set password in popup
  await popup.getByLabel("New Password").fill(password);
  await popup.getByLabel("Confirm Password").fill(password);
  await popup.getByRole("button", { name: /change password/i }).click();

  // ✅ Optional: visit dashboard to confirm activation
  await popup.getByRole("link", { name: "Login page" }).click();
  await popup.getByRole("button", { name: "ड्यासबोर्ड" }).click();

  // 6️⃣ Close popup after activation
  await popup.close();

  // 7️⃣ Clear cookies + storage on **your app domain**, not Mailinator
  const context = page.context();
  await context.clearCookies();

  // Navigate to app domain to clear localStorage/sessionStorage
  await page.goto("https://dma-dev.naxa.com.np/dashboard/building", {
    waitUntil: "networkidle",
  });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  page.reload();
  await page.getByRole("button", { name: "साइन इन" }).click();
  // 8️⃣ Now login on main page
  await page.getByLabel("इमेल").fill(email);
  await page.getByLabel("पासवर्ड").fill(password);
  await page.getByRole("button", { name: "लग इन" }).click();

  // 9️⃣ Assert dashboard
  await expect(page).toHaveURL(/dashboard\/building/);
}
