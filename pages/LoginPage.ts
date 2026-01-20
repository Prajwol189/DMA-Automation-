import { type Locator, type Page } from '@playwright/test';

export class LoginPage {
    readonly page: Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;

    constructor(page: Page) {
        this.page = page;
        // robust strategies for finding elements
        this.emailInput = page.locator('input[type="email"], input[name="email"], [placeholder*="email" i]');
        this.passwordInput = page.locator('input[type="password"], input[name="password"], [placeholder*="password" i]');
        this.loginButton = page.locator('button[type="submit"]');
    }

    async goto() {
        await this.page.goto('/login');
    }

    async login(email: string, pass: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(pass);
        await this.loginButton.click();
    }
}
