import { test, expect } from "@playwright/test";
import { VisualizationPage } from "../pages/VisualizationPage";

/**
 * Test suite: Visualization - Base Map Verification
 * This suite verifies various functionalities of the Visualization page including:
 * - Base map loading
 * - Layer toggles (road, building, administrative boundaries)
 * - Toolbox actions (add house, add road, proximity analysis)
 * - Map interactions (GPS pin clicks, distance measurement)
 * - Export functionality
 */
test.describe("Visualization - Base Map Verification", () => {
  let visualizationPage: VisualizationPage;

  // Runs before each test in this suite
  test.beforeEach(async ({ page }) => {
    visualizationPage = new VisualizationPage(page);

    // Navigate to the visualization page
    await page.goto("/visualization");
    await page.waitForTimeout(2000);
    page.reload();
    await page.waitForTimeout(2000);
    // Ensure page is fully loaded
  });

  /**
   * Test: Verify Naxa Layer & Satellite base maps load correctly
   */
  test("TC-01: Verify Naxa Layer & Satellite base maps load correctly", async () => {
    // Select and verify Naxa Layer
    await visualizationPage.selectBaseMap(
      visualizationPage.naxaLayerMap,
      "shortbread_v1",
    );

    // Select and verify Satellite Layer
    await visualizationPage.selectBaseMap(
      visualizationPage.satelliteMap,
      "World_Imagery/MapServer/tile",
    );
  });

  /**
   * Test: Verify toggling Road and Building layers
   * - Turn OFF, refresh, and verify API is NOT called
   * - Turn ON, refresh, and verify API is called
   */
  test("Default ON -> OFF -> ON (Road + Building API verify)", async ({
    page,
  }) => {
    const viz = new VisualizationPage(page);

    await viz.openLayerPanel();

    const roadToggle = page.getByRole("switch").first();
    const buildingToggle = page.getByRole("switch").nth(1);

    // ROAD OFF
    await roadToggle.click();
    await viz.refreshMapTiles();
    await viz.verifyApiNotCalled("/api/v1/tile/road-vector-tile/");
    await page.waitForTimeout(2000);
    // ROAD ON
    await viz.toggleOnAndVerifyApi(
      roadToggle,
      "/api/v1/tile/road-vector-tile/",
    );

    // BUILDING OFF
    await buildingToggle.click();

    await viz.refreshMapTiles();

    await viz.verifyApiNotCalled("/api/v1/tile/building-vector-tile/");

    // BUILDING ON
    await viz.toggleOnAndVerifyApi(
      buildingToggle,
      "/api/v1/tile/building-vector-tile/",
    );
  });

  /**
   * Test: Verify Palika and Ward boundary toggles
   */
  test("Palika + Ward boundary toggle ON/OFF API verify", async ({ page }) => {
    const viz = new VisualizationPage(page);

    await viz.openLayerPanel();

    // Expand Administrative Boundaries section
    await page.getByText("Administrative Boundariesexpand_more").click();

    const wardToggle = page.getByRole("switch").nth(2);
    const palikaToggle = page.getByRole("switch").nth(3);

    // WARD OFF (default ON)
    await wardToggle.click();
    await viz.refreshMapTiles();
    await viz.verifyApiNotCalled("/api/v1/tile/palika-ward-boundary/");

    // WARD ON
    await viz.toggleOnAndVerifyApi(
      wardToggle,
      "/api/v1/tile/palika-ward-boundary/",
    );

    // PALIKA OFF (default ON)
    await palikaToggle.click();
    await viz.refreshMapTiles();
    await viz.verifyApiNotCalled("/api/v1/tile/palika-boundary/");

    // PALIKA ON
    await viz.toggleOnAndVerifyApi(
      palikaToggle,
      "/api/v1/tile/palika-boundary/",
    );
  });

  /**
   * Test: Verify Toolbox actions - Add House / Add Road
   */
  test("Toolbox Add House / Add Road navigation verify", async ({ page }) => {
    const viz = new VisualizationPage(page);

    await viz.openToolbox();

    // Add House
    await viz.clickAddHouse();
    await viz.verifyBuildingFormUrl();

    // Go back to visualization page
    await page.goBack();

    await viz.openToolbox();

    // Add Road
    await viz.clickAddRoad();
    await viz.verifyRoadFormUrl();
  });

  /**
   * Test: Verify map export functionality (A3, A2, A1)
   */
  test("Export map in different sizes", async ({ page }) => {
    const exportPage = new VisualizationPage(page);
    await exportPage.waitForMapToLoad();
    // Open export menu
    await page
      .locator("div")
      .filter({ hasText: /^build_circle$/ })
      .click();

    await exportPage.exportBtn.click();

    // Export and verify different sizes
    await exportPage.selectA3fromA4();
    await exportPage.downloadAndVerify();

    await exportPage.selectA2fromA3();
    await exportPage.downloadAndVerify();

    await exportPage.selectA1fromA2();
    await exportPage.downloadAndVerify();
  });

  /**
   * Test: Proximity Analysis workflow
   */
  test("Proximity Analysis - POM", async ({ page }) => {
    const toolbox = new VisualizationPage(page);

    await toolbox.openToolbox();
    await toolbox.clickNearDistance();
    await toolbox.selectHouse();
    await toolbox.waitForMapToLoad();

    // Click map, enter radius, and run analysis
    await toolbox.clickOnMap(537, 510);
    await toolbox.enterRadius("50");
    await toolbox.runAnalysis();
    await toolbox.waitForMapToLoad();
    await toolbox.verifyResultVisible();

    // Verify default toggles for building/road layers
    await toolbox.verifyTogglesDefaultOn();

    // Toggle verification (API checks)
    await toolbox.toggleBuildingOff();
    await toolbox.toggleBuildingOn();
    await toolbox.toggleRoadOff();
    await toolbox.toggleRoadOn();
  });

  /**
   * Test: Distance measurement tool
   */
  test("Measurement sum should match total", async ({ page }) => {
    const measurementPage = new VisualizationPage(page);

    await measurementPage.openDistanceTool();
    await measurementPage.waitForMapToLoad();

    // Draw distance lines on the map
    await measurementPage.drawDistance([
      { x: 616, y: 203 },
      { x: 635, y: 252 },
      { x: 629, y: 314 },
      { x: 658, y: 374 },
      { x: 658, y: 374 }, // double click / last point
    ]);

    // Verify sum matches expected total
    await measurementPage.expectSumEqualsTotal(
      ["652.94 m", "773.93 m", "828.04 m"],
      "2254.90 m",
    );
  });

  /**
   * Test: Verify GPS pin clicks trigger correct my-location-info API
   */
  test("Verify GPS pin map clicks trigger correct my-location-info API", async ({
    page,
  }) => {
    const mapPage = new VisualizationPage(page);

    await mapPage.openGpsPinTool();

    // First click
    await mapPage.clickMapAndVerifyApi(
      653,
      292,
      27.782570623984967,
      85.33527454190073,
    );

    // Second click
    await mapPage.clickMapAndVerifyApi(
      615,
      411,
      27.769272947009412,
      85.33047523366326,
    );

    // Repeat first coordinate
    await mapPage.clickMapAndVerifyApi(
      653,
      292,
      27.782570623984967,
      85.33527454190073,
    );
  });
});
