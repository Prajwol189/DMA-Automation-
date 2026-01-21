import { Page, Locator, expect } from "@playwright/test";

export class AddRoadPage {
  readonly page: Page;

  // Navigation
  readonly roadDataLink: Locator;
  readonly addRoadButton: Locator;

  // Dropdowns
  readonly roadCategory: Locator;
  readonly administrativeClass: Locator;
  readonly roadSurfaceType: Locator;
  readonly municipalRoadClass: Locator;

  // Inputs
  readonly roadNameEn: Locator;
  readonly roadCode: Locator;

  // Buttons
  readonly nextButton: Locator;
  readonly completeButton: Locator;
  readonly submitAnywaysButton: Locator;

  // Map
  readonly mapRegion: Locator;

  constructor(page: Page) {
    this.page = page;

    // Navigation
    this.roadDataLink = page.getByRole("link", { name: "सडक डेटा" });
    this.addRoadButton = page.getByRole("button", {
      name: "add नयाँ सडक थप्नुहोस्",
    });

    // Dropdowns
    this.roadCategory = page.getByRole("textbox", {
      name: "सडक श्रेणी छान्नुहोस्",
    });

    this.administrativeClass = page.getByRole("textbox", {
      name: "प्रशासनिक वर्ग छान्नुहोस्",
    });

    this.roadSurfaceType = page.getByRole("textbox", {
      name: "सडक बाटो प्रकार छान्नुहोस्",
    });

    this.municipalRoadClass = page.getByRole("textbox", {
      name: "नगर सडक वर्ग छान्नुहोस्",
    });

    // Inputs
    this.roadNameEn = page.locator('input[name="road_name_en"]');
    this.roadCode = page.getByRole("textbox", {
      name: "e.g. 27-M-01-A001",
    });

    // Buttons
    this.nextButton = page.getByRole("button", {
      name: /Next|अर्को chevron_right/i,
    });
    this.completeButton = page.getByRole("button", {
      name: "Complete chevron_right",
    });
    this.submitAnywaysButton = page.getByRole("button", {
      name: "Submit Anyways chevron_right",
    });

    // Map
    this.mapRegion = page.getByRole("region", { name: "Map" });
  }

  async goto() {
    await this.page.goto("/data-management/road-data", {
      waitUntil: "networkidle",
    });
  }

  async clickAddRoad() {
    await expect(this.addRoadButton).toBeVisible();
    await this.addRoadButton.click();

    await expect(this.roadCategory).toBeVisible({ timeout: 10000 });
  }

  // ✅ Common dropdown handler (same as building)
  async selectDropdown(dropdown: Locator, optionText: string) {
    await expect(dropdown).toBeVisible({ timeout: 10000 });
    await dropdown.click();

    const option = this.page
      .getByRole("listitem")
      .filter({ hasText: optionText });

    await expect(option.first()).toBeVisible({ timeout: 5000 });
    await option.first().click();
  }

  async fillRoadName(name: string) {
    await expect(this.roadNameEn).toBeVisible();
    await this.roadNameEn.fill(name);
  }

  async fillRoadCode(code: string) {
    await this.roadCode.fill(code);
  }

  async clickNext() {
    await expect(this.nextButton).toBeEnabled({ timeout: 10000 });
    await this.nextButton.click();
  }

  // Draw road line on map (relative positions)
  async drawRoadOnMapRelative(points: { x: number; y: number }[]) {
    await expect(this.mapRegion).toBeVisible({ timeout: 10000 });

    const box = await this.mapRegion.boundingBox();
    if (!box) throw new Error("Map bounding box not found");

    for (const point of points) {
      const absX = box.x + box.width * point.x;
      const absY = box.y + box.height * point.y;
      await this.page.mouse.click(absX, absY);
    }

    // Double click last point to finish road
    const last = points[points.length - 1];
    const lastX = box.x + box.width * last.x;
    const lastY = box.y + box.height * last.y;
    await this.page.mouse.dblclick(lastX, lastY);
  }

  async submitForm() {
    await this.completeButton.click();
    await this.submitAnywaysButton.click();
  }
}
