import { test, expect } from "@playwright/test";
import { VisualizationPage } from "../pages/VisualizationPage";

test.describe("Visualization - Base Map Verification", () => {
  let visualizationPage: VisualizationPage;

  test.beforeEach(async ({ page }) => {
    visualizationPage = new VisualizationPage(page);

    // Uses stored login session
    await page.goto("/visualization");
    await page.reload({ timeout: 60000 });
  });

  test("TC-01: Verify Naxa Layer & Satellite base maps load correctly", async () => {
    // await visualizationPage.openLayerPanel();

    // Naxa Layer verification
    await visualizationPage.selectBaseMap(
      visualizationPage.naxaLayerMap,
      "shortbread_v1",
    );

    // Satellite verification
    await visualizationPage.selectBaseMap(
      visualizationPage.satelliteMap,
      "World_Imagery/MapServer/tile",
    );
  });
});
