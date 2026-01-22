import { Page, Locator, expect } from "@playwright/test";

export class VisualizationPage {
  readonly page: Page;
  readonly mapRegion: Locator;
  readonly layerButton: Locator;

  readonly naxaLayerMap: Locator;
  readonly satelliteMap: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mapRegion = page.getByRole("region", { name: "Map" });
    this.layerButton = page.getByRole("button", { name: "layers" });

    this.naxaLayerMap = page.getByRole("img", { name: "Naxa Layer" });
    this.satelliteMap = page.getByRole("img", { name: "Satellite" });
  }

  async openLayerPanel() {
    await this.layerButton.click();
  }
  // ✅ Building layer ON => building tile API must be called
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
  // ✅ Generic: click toggle + verify API is called (works for road/building/etc)
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

  // ✅ Generic: verify API is NOT called after toggle OFF
  async verifyApiNotCalled(apiPattern: string, waitMs: number = 4000) {
    let called = false;

    const listener = (res: any) => {
      if (res.url().includes(apiPattern)) {
        called = true;
      }
    };

    this.page.on("response", listener);

    // wait to confirm no api hit
    await this.page.waitForTimeout(waitMs);

    this.page.off("response", listener);

    expect(called).toBeFalsy();
  }

  // ✅ Optional: force map to refresh tiles (pan/zoom)
  async refreshMapTiles() {
    await this.mapRegion.hover();
    await this.page.mouse.wheel(0, -300); // zoom in
    await this.page.waitForTimeout(800);
  }
  // ✅ Toggle ON + force refresh + verify API called (best for Mapbox cached tiles)
  async toggleOnAndVerifyApi(toggle: Locator, apiPattern: string) {
    const waitApi = this.page.waitForResponse(
      (res) => res.url().includes(apiPattern) && res.status() === 200,
      { timeout: 30000 },
    );

    await toggle.click();

    // 🔥 Force tile refresh (so request MUST happen)
    await this.refreshMapTiles();

    const response = await waitApi;

    expect(response).not.toBeNull();
    expect(response.ok()).toBeTruthy();
  }
  // ===================== Toolbox Methods =====================

  async openToolbox() {
    await this.page.getByText("build_circleView ToolboxView").click();
  }

  async clickSelectHouse() {
    await this.page.getByText("houseSelect House").click();
  }

  async openOverlay() {
    await this.page.getByText("layersView OverlayView Overlay").click();
  }

  async clickAddHouse() {
    await this.page.getByText("houseभवन थप्नुहोस्").click();
  }

  async clickAddRoad() {
    await this.page.getByText("add_roadसडक थप्नुहोस्").click();
  }

  async closePanel() {
    await this.page.getByText("close").click();
  }

  async verifyBuildingFormUrl() {
    await expect(this.page).toHaveURL(/\/data-management\/building-data\/form/);
  }

  async verifyRoadFormUrl() {
    await expect(this.page).toHaveURL(/\/data-management\/road-data\/form/);
  }
}
