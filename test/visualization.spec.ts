import { test, expect, Page } from "@playwright/test";
import { VisualizationPage } from "../pages/VisualizationPage";

// ⚡ Run all tests in this describe block serially
test.describe.configure({ mode: "serial" });

test.describe("Visualization - Base Map Verification (Single Browser)", () => {
  let page: Page;
  let visualizationPage: VisualizationPage;

  // Runs once before all tests
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    visualizationPage = new VisualizationPage(page);

    // Navigate to the visualization page
    await page.goto("/visualization");
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForTimeout(2000);
  });

  // Reload page between tests to reset state
  test.afterEach(async () => {
    await page.reload();
    await page.waitForTimeout(2000);
  });

  // ---------------------------
  // TC-01: Base maps load correctly
  // ---------------------------
  test("TC-01: Base maps load correctly", async () => {
    await visualizationPage.selectBaseMap(
      visualizationPage.naxaLayerMap,
      "shortbread_v1",
    );
    await visualizationPage.selectBaseMap(
      visualizationPage.satelliteMap,
      "World_Imagery/MapServer/tile",
    );
  });

  // ---------------------------
  // TC-02: Road + Building toggle API verification
  // ---------------------------
  test("TC-02: Road + Building toggle API verification", async () => {
    await visualizationPage.openLayerPanel();

    const roadToggle = page.getByRole("switch").first();
    const buildingToggle = page.getByRole("switch").nth(1);

    // ROAD OFF
    await roadToggle.click();
    await visualizationPage.refreshMapTiles();
    await visualizationPage.verifyApiNotCalled(
      "/api/v1/tile/road-vector-tile/",
    );
    await page.waitForTimeout(2000);

    // ROAD ON
    await visualizationPage.toggleOnAndVerifyApi(
      roadToggle,
      "/api/v1/tile/road-vector-tile/",
    );

    // BUILDING OFF
    await buildingToggle.click();
    await visualizationPage.refreshMapTiles();
    await visualizationPage.verifyApiNotCalled(
      "/api/v1/tile/building-vector-tile/",
    );

    // BUILDING ON
    await visualizationPage.toggleOnAndVerifyApi(
      buildingToggle,
      "/api/v1/tile/building-vector-tile/",
    );
  });

  // ---------------------------
  // TC-03: Administrative boundaries toggle
  // ---------------------------
  test("TC-03: Administrative boundaries toggle", async () => {
    await visualizationPage.openLayerPanel();
    await page.getByText("Administrative Boundariesexpand_more").click();

    const wardToggle = page.getByRole("switch").nth(2);
    const palikaToggle = page.getByRole("switch").nth(3);

    // WARD OFF
    await wardToggle.click();
    await visualizationPage.refreshMapTiles();
    await visualizationPage.verifyApiNotCalled(
      "/api/v1/tile/palika-ward-boundary/",
    );

    // WARD ON
    await visualizationPage.toggleOnAndVerifyApi(
      wardToggle,
      "/api/v1/tile/palika-ward-boundary/",
    );

    // PALIKA OFF
    await palikaToggle.click();
    await visualizationPage.refreshMapTiles();
    await visualizationPage.verifyApiNotCalled("/api/v1/tile/palika-boundary/");

    // PALIKA ON
    await visualizationPage.toggleOnAndVerifyApi(
      palikaToggle,
      "/api/v1/tile/palika-boundary/",
    );
  });

  // ---------------------------
  // TC-04: Toolbox Add House / Add Road
  // ---------------------------
  test("TC-04: Toolbox Add House / Add Road", async () => {
    await visualizationPage.openToolbox();

    // Add House
    await visualizationPage.clickAddHouse();
    await visualizationPage.verifyBuildingFormUrl();
    await page.goBack();

    await visualizationPage.openToolbox();

    // Add Road
    await visualizationPage.clickAddRoad();
    await visualizationPage.verifyRoadFormUrl();
    await page.goBack();
  });

  // ---------------------------
  // TC-05: Map export functionality
  // ---------------------------
  test("TC-05: Map export functionality", async () => {
    await visualizationPage.waitForMapToLoad();
    await page
      .locator("div")
      .filter({ hasText: /^build_circle$/ })
      .click();
    await visualizationPage.exportBtn.click();

    await visualizationPage.selectA3fromA4();
    await visualizationPage.downloadAndVerify();

    await visualizationPage.selectA2fromA3();
    await visualizationPage.downloadAndVerify();

    await visualizationPage.selectA1fromA2();
    await visualizationPage.downloadAndVerify();
  });

  // ---------------------------
  // TC-06: Proximity Analysis
  // ---------------------------
  test("TC-06: Proximity Analysis", async () => {
    await visualizationPage.openToolbox();
    await visualizationPage.clickNearDistance();
    await visualizationPage.selectHouse();

    await visualizationPage.clickOnMap(537, 510);
    await visualizationPage.enterRadius("50");
    await visualizationPage.runAnalysis();
    await visualizationPage.waitForMapToLoad();
    await visualizationPage.verifyResultVisible();

    await visualizationPage.verifyTogglesDefaultOn();
    await visualizationPage.toggleBuildingOff();
    await visualizationPage.toggleBuildingOn();
    await visualizationPage.toggleRoadOff();
    await visualizationPage.toggleRoadOn();
  });

  // ---------------------------
  // TC-07: Distance measurement tool
  // ---------------------------
  test("TC-07: Distance measurement tool", async () => {
    await visualizationPage.openDistanceTool();
    await visualizationPage.waitForMapToLoad();

    await visualizationPage.drawDistance([
      { x: 616, y: 203 },
      { x: 635, y: 252 },
      { x: 629, y: 314 },
      { x: 658, y: 374 },
      { x: 658, y: 374 },
    ]);

    await visualizationPage.expectSumEqualsTotal(
      ["652.94 m", "773.93 m", "828.04 m"],
      "2254.90 m",
    );
  });

  // ---------------------------
  // TC-08: GPS pin click API verification
  // ---------------------------
  test("TC-08: GPS pin click API verification", async () => {
    await visualizationPage.openGpsPinTool();

    await visualizationPage.clickMapAndVerifyApi(
      653,
      292,
      27.782570623984967,
      85.33527454190073,
    );

    await visualizationPage.clickMapAndVerifyApi(
      615,
      411,
      27.769272947009412,
      85.33047523366326,
    );

    await visualizationPage.clickMapAndVerifyApi(
      653,
      292,
      27.782570623984967,
      85.33527454190073,
    );
  });
});
