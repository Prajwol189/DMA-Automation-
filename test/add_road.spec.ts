import { test, expect, Page } from "@playwright/test";
import { AddRoadPage } from "../pages/AddRoadPage";

test.describe.serial("Add Road - All in one browser", () => {
  let page: Page;
  let roadPage: AddRoadPage;

  // Runs once before all tests
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    roadPage = new AddRoadPage(page);

    // Navigate directly to road form page
    await page.goto("/data-management/road-data");
  });

  // Reset form between tests
  test.afterEach(async () => {
    await page.reload();
  });

  /**
   * ✅ TC-01: Add road with all mandatory fields (Happy Path)
   */

  test("TC-01: Add new road successfully", async () => {
    const roadName = `prajwol-${Date.now() + 1}`;

    const updatedName = `prajwol-${Date.now()}`;
    await roadPage.clickAddRoad();
    await roadPage.selectDropdown(roadPage.roadCategory, "Major");
    await roadPage.fillRoadName(roadName);
    await roadPage.clickNext();
    await roadPage.page.waitForTimeout(3000);
    await roadPage.drawRoadOnMapRelative([
      { x: 0.45, y: 0.52 },
      { x: 0.55, y: 0.48 },
      { x: 0.65, y: 0.5 },
    ]);
    await roadPage.clickNext();
    await roadPage.selectDropdown(
      roadPage.administrativeClass,
      "National highway",
    );
    await roadPage.selectDropdown(roadPage.roadSurfaceType, "Black Topped");
    await roadPage.selectDropdown(roadPage.municipalRoadClass, "A");
    await roadPage.clickNext();
    await roadPage.submitForm();

    await expect(
      roadPage.page.getByText(/road added successfully/i),
    ).toBeVisible({
      timeout: 10000,
    });
    // ---------- SEARCH ----------
    await roadPage.searchRoad(roadName);
    await roadPage.page.waitForTimeout(1000); // wait for search results to load

    // ---------- EDIT ----------
    await roadPage.editRoad(updatedName);

    // ---------- SEARCH UPDATED ----------
    await roadPage.searchRoad(updatedName);
    await roadPage.verifyRoadExists(updatedName);

    // ---------- INFO ----------
    await roadPage.openInfoAndVerify();
    await roadPage.goHomeAndVerify();
    await roadPage.goToRoadListAndOpenInfo(updatedName);

    // ---------- HOME ----------

    // ---------- BACK TO ROAD DATA ----------

    // ---------- PREVIEW ----------
    await roadPage.openPreviewAndClose(updatedName);

    // ---------- DELETE ----------
    await roadPage.deleteRoad();

    // ---------- VERIFY DELETE ----------
    await roadPage.goToRoadListAndOpenInfo(updatedName);

    await roadPage.verifyRoadNotExists();
  });

  /**
   * ❌ TC-02: Validation – Road category is mandatory
   */
  test("TC-All: Road form validation checks with visible pauses", async () => {
    const roadName = "dallu";
    await roadPage.clickAddRoad();
    // ---------- TC-02: Road category missing ----------
    await roadPage.fillRoadName(roadName);
    await roadPage.clickNext();
    await expect(roadPage.page.getByText(/सडक श्रेणी/i)).toBeVisible();
    await roadPage.page.waitForTimeout(2000); // pause 2s

    // ---------- TC-03: Road name missing ----------
    await roadPage.selectDropdown(roadPage.roadCategory, "Major");
    await roadPage.roadNameEn.fill(""); // clear road name
    await roadPage.clickNext();
    await expect(roadPage.page.getByText(/road name/i)).toBeVisible();
    await roadPage.page.waitForTimeout(2000);

    // ---------- TC-04: Road not drawn on map ----------
    await roadPage.fillRoadName(roadName);
    await roadPage.clickNext();
    // Skip drawing
    await roadPage.clickNext();
    await expect(roadPage.page.getByText(/draw a geometry/i)).toBeVisible();
    await roadPage.page.waitForTimeout(2000);

    // ---------- TC-05: Administrative class missing ----------
    await roadPage.drawRoadOnMapRelative([
      { x: 0.45, y: 0.52 },
      { x: 0.55, y: 0.48 },
      { x: 0.65, y: 0.5 },
    ]);
    await roadPage.clickNext();
    // Skip administrative class
    await roadPage.clickNext();
    await expect(roadPage.page.getByText("Required").first()).toBeVisible();
    await roadPage.page.waitForTimeout(2000);

    // ---------- TC-06: Road surface type missing ----------
    await roadPage.selectDropdown(
      roadPage.administrativeClass,
      "National highway",
    );
    // Skip road surface type
    await roadPage.clickNext();
    await expect(roadPage.page.getByText(/बाटो प्रकार/i)).toBeVisible();
    await roadPage.page.waitForTimeout(2000);

    // ---------- TC-07: Municipal road class missing ----------
    await roadPage.selectDropdown(roadPage.roadSurfaceType, "Black Topped");
    // Skip municipal road class
    await roadPage.clickNext();
    await expect(roadPage.page.getByText(/नगर सडक वर्ग/i)).toBeVisible();
    await roadPage.page.waitForTimeout(2000);
  });
});
