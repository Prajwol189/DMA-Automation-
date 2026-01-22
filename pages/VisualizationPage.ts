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
}
