import { Page, Locator, expect } from "@playwright/test";

export class StylingPage {
  readonly page: Page;

  readonly saveBtn: Locator;
  readonly successToast: Locator;
  readonly baseMapDropdown: Locator;

  constructor(page: Page) {
    this.page = page;

    this.saveBtn = page.getByRole("button", {
      name: "Save Layer Arrangement",
    });
    this.successToast = page.getByText("Layer setting updated successfully");

    this.baseMapDropdown = page.locator("p.text-sm.capitalize").locator("..");
  }

  // ================= Navigation =================
  async openStyling() {
    await this.page.goto("/setting/styling");
  }

  async openVisualization() {
    await this.page.goto("/visualization");
    await this.page.waitForTimeout(2000);
  }

  // ================= Styling Actions =================
  async selectBaseMap(type: string) {
    await this.baseMapDropdown.click();
    await this.page.getByRole("listitem").filter({ hasText: type }).click();
  }

  async verifyBaseMapApi(pattern: string) {
    const tileRequestPromise = this.page.waitForResponse(
      (res) => res.url().includes(pattern) && res.status() === 200,
      { timeout: 30000 },
    );
  }
  async saveAndVerify() {
    await this.saveBtn.click();
    await this.page.waitForTimeout(1000); // optional small wait for toast
  }

  async toggle(index: number) {
    const toggle = this.page.getByRole("switch").nth(index);
    await toggle.click();
  }

  async expandAdminBoundary() {
    await this.page.getByText("Administrative Boundariesexpand_more").click();
  }

  // ================= Map / Tile Actions =================
  async refreshMapTiles() {
    const mapRegion = this.page.locator("role=region[name=Map]");
    await mapRegion.hover();
    await this.page.waitForTimeout(800);
    await this.page.mouse.wheel(0, -3100);
    await this.page.mouse.wheel(0, -3100);
    await this.page.waitForTimeout(800);
  }

  async verifyApiNotCalled(pattern: string, waitMs = 4000) {
    let called = false;
    const listener = (res: any) => {
      if (res.url().includes(pattern)) called = true;
    };
    this.page.on("response", listener);
    await this.page.waitForTimeout(waitMs);
    this.page.off("response", listener);

    expect(called).toBeFalsy();
  }

  async toggleOnAndVerifyApi(toggle: Locator, apiPattern: string) {
    const waitApi = this.page.waitForResponse(
      (res) => res.url().includes(apiPattern) && res.status() === 200,
      { timeout: 30000 },
    );
    await toggle.click();
    await this.refreshMapTiles();

    const response = await waitApi;
    expect(response).not.toBeNull();
    expect(response.ok()).toBeTruthy();
  }

  async verifyToggleApi(toggleIndex: number, apiPattern: string) {
    const toggle = this.page.getByRole("switch").nth(toggleIndex);
    await this.toggleOnAndVerifyApi(toggle, apiPattern);
  }

  // ================= New Method: Verify all layers at once =================
  async verifyAllLayersApi() {
    // Hover + zoom
    const mapRegion = this.page.locator("role=region[name=Map]");
    await mapRegion.hover();
    await this.page.waitForTimeout(500);

    // Prepare promises BEFORE map loads
    const apiPatterns = [
      "/api/v1/tile/road-vector-tile/",
      "/api/v1/tile/building-vector-tile/",
      "/api/v1/tile/palika-ward-boundary/",
      "/api/v1/tile/palika-boundary/",
    ];

    const apiPromises = apiPatterns.map((pattern) =>
      this.page.waitForResponse(
        (res) => res.url().includes(pattern) && res.status() === 200,
        {
          timeout: 30000,
        },
      ),
    );

    // Zoom to trigger map tiles
    await this.page.mouse.wheel(0, -3100);

    await this.page.waitForTimeout(1000);

    // Wait all APIs
    const responses = await Promise.all(apiPromises);

    // Assert all responses OK
    responses.forEach((res) => {
      expect(res).not.toBeNull();
      expect(res.ok()).toBeTruthy();
    });
  }
}
