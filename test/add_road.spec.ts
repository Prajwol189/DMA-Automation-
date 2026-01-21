import { test, expect } from "@playwright/test";
import { AddRoadPage } from "../pages/AddRoadPage";

/**
 * Test Suite: Add Road Feature
 * Covers:
 *  - Successful road creation
 *  - Mandatory field validations
 *  - Map drawing validations
 */
test.describe("Add Road - Test Cases", () => {
  let roadPage: AddRoadPage;

  /**
   * Runs before each test
   * Uses stored login session (NO LOGIN HERE)
   */
  test.beforeEach(async ({ page }) => {
    roadPage = new AddRoadPage(page);

    // Directly navigate to road module
    await page.goto("/data-management/road-data/form");
  });

  /**
   * ✅ TC-01: Add road with all mandatory fields (Happy Path)
   */
  test("TC-01: Add new road successfully", async () => {
    // Step 1: Basic details
    await roadPage.selectDropdown(roadPage.roadCategory, "Major");
    await roadPage.fillRoadName("dallu");
    await roadPage.clickNext();
    await roadPage.page.waitForTimeout(3000);
    // Step 2: Draw road geometry on map
    await roadPage.drawRoadOnMapRelative([
      { x: 0.45, y: 0.52 },
      { x: 0.55, y: 0.48 },
      { x: 0.65, y: 0.5 },
    ]);
    await roadPage.clickNext();

    // Step 3: Road classification
    await roadPage.selectDropdown(
      roadPage.administrativeClass,
      "National highway",
    );
    await roadPage.selectDropdown(roadPage.roadSurfaceType, "Black Topped");
    await roadPage.selectDropdown(roadPage.municipalRoadClass, "A");

    await roadPage.clickNext();

    // Step 4: Submit form
    await roadPage.submitForm();

    // Validation
    await expect(
      roadPage.page.getByText(/road added successfully/i),
    ).toBeVisible({ timeout: 10000 });
  });

  /**
   * ❌ TC-02: Validation – Road category is mandatory
   */
  test("TC-02: Validation error when road category is not selected", async () => {
    await roadPage.fillRoadName("dallu");
    await roadPage.clickNext();

    await expect(roadPage.page.getByText(/सडक श्रेणी/i)).toBeVisible();
  });

  /**
   * ❌ TC-03: Validation – Road name is mandatory
   */
  test("TC-03: Validation error when road name is missing", async () => {
    await roadPage.selectDropdown(roadPage.roadCategory, "Major");
    await roadPage.clickNext();

    await expect(roadPage.page.getByText(/road name/i)).toBeVisible();
  });

  /**
   * ❌ TC-04: Validation – Road must be drawn on map
   */
  test("TC-04: Validation error when road is not drawn on map", async () => {
    await roadPage.selectDropdown(roadPage.roadCategory, "Major");
    await roadPage.fillRoadName("dallu");
    await roadPage.clickNext();

    // Skip drawing
    await roadPage.clickNext();

    await expect(roadPage.page.getByText(/draw a geometry/i)).toBeVisible();
  });

  /**
   * ❌ TC-05: Validation – Administrative class is required
   */
  test("TC-05: Validation error when administrative class is not selected", async () => {
    await roadPage.selectDropdown(roadPage.roadCategory, "Major");
    await roadPage.fillRoadName("dallu");
    await roadPage.clickNext();
    await roadPage.page.waitForTimeout(3000);
    await roadPage.drawRoadOnMapRelative([
      { x: 0.45, y: 0.52 },
      { x: 0.55, y: 0.48 },
      { x: 0.65, y: 0.5 },
    ]);
    await roadPage.clickNext();

    await roadPage.clickNext();

    await expect(roadPage.page.getByText("Required").first()).toBeVisible({
      timeout: 5000,
    });
  });

  /**
   * ❌ TC-06: Validation – Road surface type is required
   */
  test("TC-06: Validation error when road surface type is missing", async () => {
    await roadPage.selectDropdown(roadPage.roadCategory, "Major");
    await roadPage.fillRoadName("dallu");
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

    await roadPage.clickNext();

    await expect(roadPage.page.getByText(/बाटो प्रकार/i)).toBeVisible();
  });

  /**
   * ❌ TC-07: Validation – Municipal road class is required
   */
  test("TC-07: Validation error when municipal road class is missing", async () => {
    await roadPage.selectDropdown(roadPage.roadCategory, "Major");
    await roadPage.fillRoadName("dallu");
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

    await roadPage.clickNext();

    await expect(roadPage.page.getByText(/नगर सडक वर्ग/i)).toBeVisible();
  });
});
