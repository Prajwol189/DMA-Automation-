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
  test("Default ON -> OFF -> ON (Road + Building API verify)", async ({
    page,
  }) => {
    const viz = new VisualizationPage(page);

    await viz.openLayerPanel();

    const roadToggle = page.getByRole("switch").first();
    const buildingToggle = page.getByRole("switch").nth(1);

    // ✅ ROAD OFF
    await roadToggle.click();
    await viz.refreshMapTiles();
    await viz.verifyApiNotCalled("/api/v1/tile/road-vector-tile/");

    // ✅ ROAD ON (force refresh + verify api)
    await viz.toggleOnAndVerifyApi(
      roadToggle,
      "/api/v1/tile/road-vector-tile/",
    );

    // ✅ BUILDING OFF
    await buildingToggle.click();
    await viz.refreshMapTiles();
    await viz.verifyApiNotCalled("/api/v1/tile/building-vector-tile/");

    // ✅ BUILDING ON (force refresh + verify api)
    await viz.toggleOnAndVerifyApi(
      buildingToggle,
      "/api/v1/tile/building-vector-tile/",
    );
  });
  test("Palika + Ward boundary toggle ON/OFF API verify", async ({ page }) => {
    const viz = new VisualizationPage(page);

    await viz.openLayerPanel();

    // open Administrative Boundaries
    await page.getByText("Administrative Boundariesexpand_more").click();

    const wardToggle = page.getByRole("switch").nth(2);
    const palikaToggle = page.getByRole("switch").nth(3);

    // ✅ WARD OFF (default ON)
    await wardToggle.click();
    await viz.refreshMapTiles();
    await viz.verifyApiNotCalled("/api/v1/tile/palika-ward-boundary/");

    // ✅ WARD ON
    await viz.toggleOnAndVerifyApi(
      wardToggle,
      "/api/v1/tile/palika-ward-boundary/",
    );

    // ✅ PALIKA OFF (default ON)
    await palikaToggle.click();
    await viz.refreshMapTiles();
    await viz.verifyApiNotCalled("/api/v1/tile/palika-boundary/");

    // ✅ PALIKA ON
    await viz.toggleOnAndVerifyApi(
      palikaToggle,
      "/api/v1/tile/palika-boundary/",
    );
  });
});
