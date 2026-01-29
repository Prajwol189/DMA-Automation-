import { test, expect, Page } from "@playwright/test";
import { VisualizationPage } from "../pages/VisualizationPage";

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

  /**
   * TC-01: Verify Naxa Layer & Satellite base maps load correctly
   */
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

  /**
   * TC-02: Default ON -> OFF -> ON (Road + Building API verify)
   */
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

  /**
   * TC-03: Palika + Ward boundary toggle ON/OFF API verify
   */
  test("TC-03: Administrative boundaries toggle", async () => {
    await visualizationPage.openLayerPanel();

    // Expand Administrative Boundaries section
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

  /**
   * TC-04: Toolbox Add House / Add Road navigation verify
   */
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
  });

  /**
   * TC-05: Export map in different sizes
   */
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

  /**
   * TC-06: Proximity Analysis workflow
   */
  test("TC-06: Proximity Analysis", async () => {
    await visualizationPage.openToolbox();
    await visualizationPage.clickNearDistance();
    await visualizationPage.selectHouse();
    await visualizationPage.waitForMapToLoad();

    await visualizationPage.clickOnMap(537, 510);
    await visualizationPage.enterRadius("50");
    await visualizationPage.runAnalysis();
    await visualizationPage.waitForMapToLoad();
    await visualizationPage.verifyResultVisible();

    // Toggle verification
    await visualizationPage.verifyTogglesDefaultOn();
    await visualizationPage.toggleBuildingOff();
    await visualizationPage.toggleBuildingOn();
    await visualizationPage.toggleRoadOff();
    await visualizationPage.toggleRoadOn();
  });

  /**
   * ✅ TC-06: Proximity Analysis – Happy Path
   */
  test("TC-06: Proximity Analysis with valid inputs", async () => {
    await visualizationPage.openToolbox();
    await visualizationPage.clickNearDistance();
    await visualizationPage.selectHouse();

    await visualizationPage.clickOnMap(537, 510);
    await visualizationPage.enterRadius("50");
    await visualizationPage.runAnalysis();
    await visualizationPage.waitForMapToLoad();

    await visualizationPage.verifyResultVisible();

    // Toggle verification
    await visualizationPage.verifyTogglesDefaultOn();
    await visualizationPage.toggleBuildingOff();
    await visualizationPage.toggleBuildingOn();
    await visualizationPage.toggleRoadOff();
    await visualizationPage.toggleRoadOn();
  });

  /**
   * ❌ TC-07: Run analysis without selecting map location
   */

  // test("TC-07: Proximity - without map click", async () => {
  //   await visualizationPage.openToolbox();
  //   await visualizationPage.clickNearDistance();
  //   await visualizationPage.selectHouse();

  //   await visualizationPage.enterRadius("50");
  //   await visualizationPage.runAnalysis();

  //   await visualizationPage.verifyErrorMessage(
  //     "Please select a location on the map",
  //   );
  // });
  /**
  test("TC-07: Proximity - without map click", async () => {
    await visualizationPage.openToolbox();
    await visualizationPage.clickNearDistance();
    await visualizationPage.selectHouse();

    await visualizationPage.enterRadius("50");
    await visualizationPage.runAnalysis();

    await visualizationPage.verifyErrorMessage(
      "Please select a location on the map"
    );
  });

  /**
   * ❌ TC-08: Radius is empty
   */
  // test("TC-08: Proximity - empty radius", async () => {
  //   await visualizationPage.openToolbox();
  //   await visualizationPage.clickNearDistance();
  //   await visualizationPage.selectHouse();

  //   await visualizationPage.clickOnMap(537, 510);
  //   await visualizationPage.runAnalysis();

  //   await visualizationPage.verifyErrorMessage("Radius is required");
  // });

  /**
   * ❌ TC-09: Radius is zero
   */
  // test("TC-09: Proximity - zero radius", async () => {
  //   await visualizationPage.openToolbox();
  //   await visualizationPage.clickNearDistance();
  //   await visualizationPage.selectHouse();

  //   await visualizationPage.clickOnMap(537, 510);
  //   await visualizationPage.enterRadius("0");
  //   await visualizationPage.runAnalysis();

  //   await visualizationPage.verifyErrorMessage(
  //     "Radius must be greater than 0"
  //   );
  // });

  /**
   * ❌ TC-10: Negative radius value
   */
  // test("TC-10: Proximity - negative radius", async () => {
  //   await visualizationPage.openToolbox();
  //   await visualizationPage.clickNearDistance();
  //   await visualizationPage.selectHouse();

  //   await visualizationPage.clickOnMap(537, 510);
  //   await visualizationPage.enterRadius("-10");
  //   await visualizationPage.runAnalysis();

  //   await visualizationPage.verifyErrorMessage("Invalid radius value");
  // });

  /**
   * ❌ TC-11: Non-numeric radius
   */
  // test("TC-11: Proximity - non numeric radius", async () => {
  //   await visualizationPage.openToolbox();
  //   await visualizationPage.clickNearDistance();
  //   await visualizationPage.selectHouse();

  //   await visualizationPage.clickOnMap(537, 510);
  //   await visualizationPage.enterRadius("abc");
  //   await visualizationPage.runAnalysis();

  //   await visualizationPage.verifyErrorMessage(
  //     "Radius must be a number"
  //   );
  // });

  /**
   * ⚠️ TC-12: Minimum radius boundary
   */
  // test("TC-12: Proximity - minimum radius boundary", async () => {
  //   await visualizationPage.openToolbox();
  //   await visualizationPage.clickNearDistance();
  //   await visualizationPage.selectHouse();

  //   await visualizationPage.clickOnMap(537, 510);
  //   await visualizationPage.enterRadius("1");
  //   await visualizationPage.runAnalysis();
  //   await visualizationPage.waitForMapToLoad();

  //   await visualizationPage.verifyResultVisible();
  // });

  /**
   * ⚠️ TC-13: Very large radius value
   */
  // test("TC-13: Proximity - large radius", async () => {
  //   await visualizationPage.openToolbox();
  //   await visualizationPage.clickNearDistance();
  //   await visualizationPage.selectHouse();

  //   await visualizationPage.clickOnMap(537, 510);
  //   await visualizationPage.enterRadius("100000");
  //   await visualizationPage.runAnalysis();
  //   await visualizationPage.waitForMapToLoad();

  //   await visualizationPage.verifyResultVisible();
  // });

  // /**
  //  * 🔁 TC-14: Toggle persistence after re-running analysis
  //  */
  // test("TC-14: Proximity - toggle persistence after re-run", async () => {
  //   await visualizationPage.openToolbox();
  //   await visualizationPage.clickNearDistance();
  //   await visualizationPage.selectHouse();

  //   await visualizationPage.clickOnMap(537, 510);
  //   await visualizationPage.enterRadius("50");
  //   await visualizationPage.runAnalysis();
  //   await visualizationPage.verifyResultVisible();

  //   await visualizationPage.toggleBuildingOff();
  //   await visualizationPage.runAnalysis();

  //   await visualizationPage.verifyBuildingLayerHidden();
  // });
  /**
   * TC-07: Measurement sum should match total
   */
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

  /**
   * TC-08: Verify GPS pin map clicks trigger correct my-location-info API
   */
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
