import { type Locator, type Page, expect } from "@playwright/test";

export class UserManagementPage {
  readonly page: Page;
  readonly addUserButton: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly designationInput: Locator;
  readonly roleTextbox: Locator;
  readonly submitButton: Locator;
  readonly modalRoot: Locator;

  constructor(page: Page) {
    this.page = page;

    this.addUserButton = page.getByRole("button", {
      name: "नयाँ प्रयोगकर्ता थप्नुहोस्",
    });

    // 🔒 Modal root identified by form content (no ARIA dialog)
    this.modalRoot = page.locator("form", {
      hasText: "User Name",
    });

    this.nameInput = page.getByPlaceholder("Enter User Name");
    this.emailInput = page.getByPlaceholder("Enter Email Address");
    this.designationInput = page.getByPlaceholder("Enter Designation");

    // 🔒 Stable searchable dropdown textbox
    this.roleTextbox = page
      .getByRole("textbox")
      .filter({ hasText: "" })
      .first();

    this.submitButton = page.getByRole("button", { name: "Add User" });
  }

  async goto() {
    await this.page.goto("/user-management");
  }

  async clickAddUser() {
    await expect(this.addUserButton).toBeVisible();
    await this.addUserButton.click();

    // ✅ Wait for form to appear instead of dialog
    await expect(this.nameInput).toBeVisible();
  }

  async selectRole(role: string) {
    // 1️⃣ Click the dropdown placeholder
    const dropdown = this.page.getByRole("textbox", { name: "Choose" });
    await dropdown.click();

    // 2️⃣ Wait for the options to appear
    const option = this.page.getByRole("listitem").filter({ hasText: role });
    await option.first().waitFor({ state: "visible" });

    // 3️⃣ Click the option
    await option.first().click();

    // 4️⃣ Optional: ensure the dropdown shows the selected value
    // await expect(dropdown).toHaveValue(new RegExp(role, "i"));
  }

  async fillUserForm(details: {
    name: string;
    email: string;
    designation: string;
    role: string;
  }) {
    await this.nameInput.fill(details.name);
    await this.emailInput.fill(details.email);
    await this.designationInput.fill(details.designation);
    await this.selectRole(details.role);
  }

  async submit() {
    await expect(this.submitButton).toBeEnabled();
    await this.submitButton.click();
  }
}
