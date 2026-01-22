import { Page, Locator, expect, Download } from "@playwright/test";

export class VisualizationPage {
  readonly page: Page;
  readonly mapRegion: Locator;
  readonly layerButton: Locator;
  readonly naxaLayerMap: Locator;
  readonly satelliteMap: Locator;
  readonly toolbutton: Locator;
  readonly exportBtn: Locator;
  readonly downloadBtn: Locator;
  readonly nearDistanceBtn: Locator;
  readonly houseSelectBtn: Locator;

  readonly radiusInput: Locator;
  readonly runAnalysisBtn: Locator;
  readonly resultText: Locator;
  readonly buildingToggle: Locator;
  readonly roadToggle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mapRegion = page.getByRole("region", { name: "Map" });
    this.layerButton = page.getByRole("button", { name: "layers" });
    this.naxaLayerMap = page.getByRole("img", { name: "Naxa Layer" });
    this.satelliteMap = page.getByRole("img", { name: "Satellite" });
    this.toolbutton = page.getByRole("button", { name: "build_circle" });
    this.exportBtn = page.getByText("downloadएक्सपोर्ट गर्नुहोस");
    this.downloadBtn = page.getByRole("button", { name: "download Export" });
    this.nearDistanceBtn = page.getByText("hdr_strongनजिकको दूरी");
    this.houseSelectBtn = page.getByText("houseSelect House");

    this.radiusInput = page.getByPlaceholder("Enter Radius");
    this.runAnalysisBtn = page.getByRole("button", { name: "Run Analysis" });
    this.resultText = page.getByText("Proximity Result");
    this.buildingToggle = page.getByRole("switch").first();
    this.roadToggle = page.getByRole("switch").nth(1);
  }

  // ================= Map Layer / Toggle Methods =================

  async openLayerPanel() {
    await this.layerButton.click();
  }

  async verifyBuildingLayerApiCalled() {
    const response = await this.page.waitForResponse(
      (res) =>
        res.url().includes("/api/v1/tile/building-vector-tile/") &&
        res.status() === 200,
      { timeout: 15000 },
    );
    expect(response).not.toBeNull();
    expect(response.ok()).toBeTruthy();
  }

  async selectBaseMap(map: Locator, pattern: string) {
    const [tileRequest] = await Promise.all([
      this.page.waitForRequest((req) => req.url().includes(pattern), {
        timeout: 30000,
      }),
      map.click(),
    ]);
    expect(tileRequest).not.toBeNull();
    await expect(this.mapRegion).toBeVisible();
  }

  async clickToggleAndVerifyApiCalled(toggle: Locator, apiPattern: string) {
    const [response] = await Promise.all([
      this.page.waitForResponse(
        (res) => res.url().includes(apiPattern) && res.status() === 200,
        { timeout: 30000 },
      ),
      toggle.click(),
    ]);
    expect(response).not.toBeNull();
    expect(response.ok()).toBeTruthy();
  }

  async verifyApiNotCalled(apiPattern: string, waitMs: number = 4000) {
    let called = false;
    const listener = (res: any) => {
      if (res.url().includes(apiPattern)) called = true;
    };
    this.page.on("response", listener);
    await this.page.waitForTimeout(waitMs);
    this.page.off("response", listener);
    expect(called).toBeFalsy();
  }

  async refreshMapTiles() {
    await this.mapRegion.hover();
    await this.page.mouse.wheel(0, -300);
    await this.page.waitForTimeout(800);
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

  // ================= Toolbox Methods =================

  async openToolbox() {
    await this.toolbutton.click();
  }

  async clickAddHouse() {
    await this.page.getByText("houseभवन थप्नुहोस्").click();
  }

  async clickAddRoad() {
    await this.page.getByText("add_roadसडक थप्नुहोस्").click();
  }

  async verifyBuildingFormUrl() {
    await expect(this.page).toHaveURL(/\/data-management\/building-data\/form/);
  }

  async verifyRoadFormUrl() {
    await expect(this.page).toHaveURL(/\/data-management\/road-data\/form/);
  }

  // ================= Export / Download Methods =================
  // ✅ Generic dropdown select
  async selectPaperSize(currentValue: string, nextValue: string) {
    // click dropdown (example: A4arrow_drop_down)
    await this.page.getByText(`${currentValue}arrow_drop_down`).click();

    // select option (example: A3)
    const option = this.page.getByRole("listitem").filter({
      hasText: nextValue,
    });

    await option.first().waitFor({ state: "visible" });
    await option.first().click();
  }

  // ✅ Manual methods (A4 -> A3 -> A2 -> A1)
  async selectA3fromA4() {
    await this.selectPaperSize("A4", "A3");
  }

  async selectA2fromA3() {
    await this.selectPaperSize("A3", "A2");
  }

  async selectA1fromA2() {
    await this.selectPaperSize("A2", "A1");
  }

  async downloadAndVerify() {
    const downloadPromise = this.page.waitForEvent("download");
    await this.downloadBtn.click();
    const download: Download = await downloadPromise;

    const fileName = download.suggestedFilename();
    console.log("Downloaded:", fileName);

    // ✅ verify download file name exists
    expect(fileName).toBeTruthy();

    // ✅ verify file is downloaded completely
    const path = await download.path();
    expect(path).not.toBeNull();
  }

  // ===================== proximity =====================

  async clickNearDistance() {
    await this.nearDistanceBtn.click();
  }

  async selectHouse() {
    await this.houseSelectBtn.click();
  }
  async waitForMapToLoad() {
    await this.mapRegion.waitFor({ state: "visible", timeout: 60000 });
    await this.page.waitForTimeout(2000); // small wait to let tiles/features load
  }

  async clickOnMap(x: number, y: number) {
    await this.mapRegion.click({
      position: { x, y },
    });
  }

  async enterRadius(radius: string) {
    await this.radiusInput.click();
    await this.radiusInput.fill(radius);
  }

  async runAnalysis() {
    await this.runAnalysisBtn.click();
  }

  async verifyResultVisible() {
    await this.resultText.waitFor({ state: "visible" });
  }
  // ================= Map Layer / Toggle Methods =================

  // Verify default toggle state
  async verifyTogglesDefaultOn() {
    await expect(this.buildingToggle).toBeChecked();
    await expect(this.roadToggle).toBeChecked();
  }

  // Toggle building ON and verify API called
  async toggleBuildingOn() {
    await this.toggleOnAndVerifyApi(
      this.buildingToggle,
      "/api/v1/tile/building-vector-tile/",
    );
  }

  // Toggle building OFF and verify API not called
  async toggleBuildingOff() {
    await this.buildingToggle.click();
    await this.verifyApiNotCalled("/api/v1/tile/building-vector-tile/");
  }

  // Toggle road ON and verify API called
  async toggleRoadOn() {
    await this.toggleOnAndVerifyApi(
      this.roadToggle,
      "/api/v1/tile/road-vector-tile/",
    );
  }

  // Toggle road OFF and verify API not called
  async toggleRoadOff() {
    await this.roadToggle.click();
    await this.verifyApiNotCalled("/api/v1/tile/road-vector-tile/");
  }
}
