import { test, expect, Page, BrowserContext } from "@playwright/test";
import { StylingPage } from "../pages/StylingPage";
import { VisualizationPage } from "../pages/VisualizationPage";
import { symlink } from "fs";

test.describe
  .serial("Styling - Layer Arrangement Verification (Single Browser)", () => {
  let context: BrowserContext;
  let page: Page;
  let stylingPage: StylingPage;
  let visualizationPage: VisualizationPage;

  // ===================== SETUP (ONCE) =====================
  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();

    stylingPage = new StylingPage(page);

    await page.goto("/setting/styling");
    await page.waitForTimeout(2000);
    await page.reload();
    await page.waitForTimeout(2000);
  });

  // ===================== RESET BETWEEN TESTS =====================
  test.afterEach(async () => {
    await page.reload();
    await page.waitForTimeout(2000);
  });

  // ===================== CLEANUP =====================
  test.afterAll(async () => {
    await context.close();
  });

  /**
   * TC-01: Change base map dropdown and save
   */
  test("TC-01: Base map selection save verification", async () => {
    await stylingPage.selectBaseMap("OSM");
    await stylingPage.saveAndVerify();

    await stylingPage.openVisualization();
    await stylingPage.refreshMapTiles();
    await stylingPage.verifyBaseMapApi("openstreetmap");

    await stylingPage.openStyling();

    await stylingPage.selectBaseMap("Naxa Layer");
    await stylingPage.saveAndVerify();

    await stylingPage.openVisualization();
    await stylingPage.refreshMapTiles();
    await stylingPage.verifyBaseMapApi("shortbread_v1");
  });

  /**
   * TC-02: Road & Building toggle save verification
   */
  test("TC-02: Toggle all layers OFF → ON and verify in map", async () => {
    // Turn OFF all layers
    for (let i = 0; i < 4; i++) await stylingPage.toggle(i);
    await stylingPage.saveAndVerify();

    // Open visualization and ensure no API is called
    await stylingPage.openVisualization();
    await stylingPage.refreshMapTiles();
    await stylingPage.verifyApiNotCalled("/api/v1/tile/road-vector-tile/");
    await stylingPage.verifyApiNotCalled("/api/v1/tile/building-vector-tile/");
    await stylingPage.verifyApiNotCalled("/api/v1/tile/palika-ward-boundary/");
    await stylingPage.verifyApiNotCalled("/api/v1/tile/palika-boundary/");

    // Toggle all ON
    await stylingPage.openStyling();
    for (let i = 0; i < 4; i++) await stylingPage.toggle(i);
    await stylingPage.saveAndVerify();

    // Open visualization and verify all APIs called
    await stylingPage.openVisualization();
    await stylingPage.verifyAllLayersApi();
  });
});
