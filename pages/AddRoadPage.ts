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
  readonly homeButton: Locator;
  readonly moreMenuButton: Locator;
  readonly editButton: Locator;
  readonly infoButton: Locator;
  readonly previewButton: Locator;
  readonly closePreviewButton: Locator;
  readonly deleteButton: Locator;
  readonly deleteConfirmButton: Locator;
  readonly searchBox: Locator;
  readonly noDataCell: Locator;
  readonly deleteConfirmInput: Locator;

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
    this.roadDataLink = page.getByRole("link", { name: "सडक डेटा" });
    this.homeButton = page.getByRole("button", { name: "home" });

    // Search
    this.searchBox = page.getByRole("textbox", {
      name: "सडक नाम, सडक प्रकारले खोज्नुहोस्",
    });
    this.noDataCell = page.getByRole("cell", { name: "No Data found." });

    // Inputs
    this.roadNameEn = page.locator('input[name="road_name_en"]');
    this.deleteConfirmInput = page.getByRole("textbox", {
      name: "Type delete",
    });

    // Buttons
    this.moreMenuButton = page.getByRole("button", { name: "more_vert" });
    this.editButton = page.getByText("editसम्पादन गर्नुहोस्");

    this.nextButton = page.getByRole("button", {
      name: /Next chevron_right|अर्को chevron_right/i,
    });

    this.completeButton = page.getByRole("button", {
      name: "Complete chevron_right",
    });

    this.submitAnywaysButton = page.getByRole("button", {
      name: "Submit Anyways chevron_right",
    });

    this.infoButton = page.getByRole("button", { name: "info" });
    this.previewButton = page.getByRole("button", { name: "visibility" });
    this.closePreviewButton = page.getByRole("button", {
      name: /close Close modal/i,
    });

    this.deleteButton = page.getByRole("button", { name: "delete" });
    this.deleteConfirmButton = page.getByRole("button", {
      name: "delete Confirm",
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
  // ---------- SEARCH ----------
  async searchRoad(name: string) {
    await expect(this.searchBox).toBeVisible();
    await this.searchBox.fill("");
    await this.searchBox.fill(name);
  }

  async verifyRoadExists(name: string) {
    await expect(this.page.getByRole("cell", { name })).toBeVisible();
  }

  async verifyRoadNotExists() {
    await expect(this.noDataCell).toBeVisible();
  }

  // ---------- EDIT ----------
  async editRoad(newName: string) {
    await this.moreMenuButton.click();
    await this.editButton.click();

    await expect(this.roadNameEn).toBeVisible();
    await this.roadNameEn.fill(newName);

    await this.nextButton.click();
    await this.nextButton.click();
    await this.nextButton.click();

    await this.completeButton.click();
    await this.submitAnywaysButton.click();

    // success toast (combined text)
    await expect(
      this.page.getByText(/Success.*Road Edited Successfully/i),
    ).toBeVisible();
  }

  // ---------- INFO ----------
  async openInfoAndVerify() {
    await this.infoButton.first().click();
    await expect(
      this.page.locator("div", { hasText: "Road Type" }).first(),
    ).toBeVisible();
  }

  // ---------- HOME ----------
  async goHomeAndVerify() {
    await this.homeButton.click();
    await expect(this.page).toHaveURL(/visualization/);
  }
  // ---------- BACK TO LIST AND OPEN INFO ----------
  async goToRoadListAndOpenInfo(roadName: string) {
    await this.page.goto("/data-management/road-data", {
      waitUntil: "networkidle",
    });
    await expect(this.searchBox).toBeVisible({ timeout: 10000 });
    await this.searchBox.fill(roadName);
    await this.page.keyboard.press("Enter");

    // Click on the road row to open its info

    // Verify the info panel opened (adjust this locator as needed)
  }

  // ---------- PREVIEW ----------

  async openPreviewAndClose(roadName: string) {
    // Click preview
    await this.infoButton.first().click();
    await this.previewButton.click();

    // Wait for the modal container that contains the road name
    const modal = this.page
      .locator("div")
      .filter({ hasText: roadName })
      .first();
    await expect(modal).toBeVisible({ timeout: 15000 });

    // Wait for the close button inside the modal
    const closeBtn = modal.getByRole("button", { name: /close/i });
    await expect(closeBtn).toBeVisible({ timeout: 5000 });

    // Click close
    await closeBtn.click();

    // Optional: wait until modal disappears
  }

  // ---------- DELETE ----------
  async deleteRoad() {
    await this.deleteButton.click();
    await this.deleteConfirmInput.fill("delete");
    await this.deleteConfirmButton.click();
  }
}
