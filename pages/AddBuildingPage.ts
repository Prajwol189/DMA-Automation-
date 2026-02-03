import { type Locator, type Page, expect } from "@playwright/test";

export class AddBuildingPage {
  readonly page: Page;
  readonly addBuildingButton: Locator;

  // Dropdown locators
  readonly buildingAssociation: Locator;
  readonly buildingOwnership: Locator;
  readonly buildingPermanency: Locator;
  readonly registrationType: Locator;
  readonly structureType: Locator;
  readonly roofType: Locator;
  readonly buildingUseCategory: Locator;
  readonly specificBuildingUse: Locator;

  // Inputs
  readonly buildingOwnerName: Locator;
  readonly plinthArea: Locator;

  // Buttons
  readonly nextButton: Locator;
  readonly completeButton: Locator;
  readonly submitAnywaysButton: Locator;
  readonly submitButton: Locator;

  // Map region
  readonly mapRegion: Locator;

  constructor(page: Page) {
    this.page = page;

    this.addBuildingButton = page.getByRole("button", {
      name: "add नयाँ भवन थप्नुहोस्",
    });

    // 🔥 All dropdowns using textbox (clicking textbox works)
    this.buildingAssociation = page
      .getByRole("textbox")
      .filter({ hasText: "" })
      .nth(0);

    this.buildingOwnership = page
      .getByRole("textbox")
      .filter({ hasText: "" })
      .nth(1);

    this.buildingPermanency = page
      .getByRole("textbox")
      .filter({ hasText: "" })
      .nth(2);

    this.registrationType = page
      .getByRole("textbox")
      .filter({ hasText: "" })
      .nth(3);

    this.structureType = page
      .getByRole("textbox")
      .filter({ hasText: "" })
      .nth(4);

    this.roofType = page.getByRole("textbox").filter({ hasText: "" }).nth(5);

    this.buildingUseCategory = page
      .getByRole("textbox")
      .filter({ hasText: "" })
      .nth(6);

    this.specificBuildingUse = page
      .getByRole("textbox")
      .filter({ hasText: "" })
      .nth(7);

    // Inputs
    this.buildingOwnerName = page.getByPlaceholder(
      "मालिकको नाम प्रविष्ट गर्नुहोस्",
    );
    this.plinthArea = page.getByPlaceholder("Enter Plinth Area of Building");

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

    this.submitButton = page.getByRole("button", { name: "Submit" });

    // Map
    this.mapRegion = page.getByRole("region", { name: "Map" });
  }

  async goto() {
    await this.page.goto("/data-management/building-data", {
      waitUntil: "networkidle",
    });
  }

  async clickAddBuilding() {
    await expect(this.addBuildingButton).toBeVisible();
    await this.addBuildingButton.click();

    await expect(this.buildingAssociation).toBeVisible({ timeout: 10000 });
  }

  // Generic dropdown selector (works for all dropdowns)
  async selectDropdown(dropdown: Locator, optionText: string) {
    await dropdown.click();

    const option = this.page.getByRole("listitem").filter({
      hasText: optionText,
    });

    await option.first().waitFor({ state: "visible" });
    await option.first().click();
  }

  async fillOwnerName(name: string) {
    await this.buildingOwnerName.fill(name);
  }

  async clickNext() {
    await this.nextButton.click();
  }

  // Draw polygon using relative points (0 to 1 values)
  async drawPolygonOnMapRelative(points: { x: number; y: number }[]) {
    // Ensure map is visible
    await expect(this.mapRegion).toBeVisible({ timeout: 10000 });

    // Get map bounding box
    const box = await this.mapRegion.boundingBox();
    if (!box) throw new Error("Map bounding box not found");

    // Click each point
    for (const point of points) {
      const absX = box.x + box.width * point.x;
      const absY = box.y + box.height * point.y;

      await this.page.mouse.click(absX, absY);
    }

    // Double click on last point to complete polygon
    const last = points[points.length - 1];
    const lastX = box.x + box.width * last.x;
    const lastY = box.y + box.height * last.y;

    await this.page.mouse.dblclick(lastX, lastY);
  }
  async drawGateInsidePolygonRelative(point: { x: number; y: number }) {
    // Click "Draw Gate" button
    await this.page
      .getByRole("button", { name: /draw गेट खिच्नुहोस्/i })
      .click();

    await expect(this.mapRegion).toBeVisible({ timeout: 10000 });

    const box = await this.mapRegion.boundingBox();
    if (!box) throw new Error("Map bounding box not found");

    const absX = box.x + box.width * point.x;
    const absY = box.y + box.height * point.y;

    // Single click inside polygon
    await this.page.mouse.click(absX, absY);
  }
  async selectRoadAt(x: number, y: number) {
    await expect(this.mapRegion).toBeVisible();

    await this.page
      .getByRole("button", { name: /draw पुन: छान्नुहोस्/i })
      .click();

    await this.page.waitForTimeout(500);

    // zoom out
    await this.mapRegion.hover();
    await this.page.mouse.wheel(0, 100);
    await this.page.waitForTimeout(600);

    // click exact
    await this.mapRegion.click({
      position: { x, y },
      force: true,
    });

    await this.page.waitForTimeout(500);
  }

  async fillPlinthArea(value: string) {
    await this.plinthArea.fill(value);
  }

  async submitForm() {
    await this.completeButton.click();
    await this.submitAnywaysButton.click();
    await this.submitAnywaysButton.click();
    await this.submitAnywaysButton.click();
  }

  async submit() {
    await expect(this.submitButton).toBeEnabled();
    await this.submitButton.click();
  }
}
