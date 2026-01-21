import { test, expect } from "@playwright/test";
import { AddBuildingPage } from "../pages/AddBuildingPage";
import { LoginPage } from "../pages/LoginPage";
import { CREDENTIALS } from "../data/credentials";

test.describe("Add Building - Full Flow (Smooth Dropdowns)", () => {
  let buildingPage: AddBuildingPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    buildingPage = new AddBuildingPage(page);

    await loginPage.goto();
    await loginPage.login(CREDENTIALS.valid.email, CREDENTIALS.valid.password);

    await buildingPage.goto();
  });

  test("Add new building with complete flow", async () => {
    await buildingPage.clickAddBuilding();

    // Step 1: Dropdown selections
    await buildingPage.selectDropdown(buildingPage.buildingAssociation, "Main");
    await buildingPage.selectDropdown(
      buildingPage.buildingOwnership,
      "Non governmental",
    );
    await buildingPage.selectDropdown(
      buildingPage.buildingPermanency,
      "Temporary",
    );

    // Owner name
    await buildingPage.fillOwnerName("prajwol");

    // Step 2: Map selections
    await buildingPage.clickNext();

    await buildingPage.drawPolygonOnMapRelative([
      { x: 0.55, y: 0.45 },
      { x: 0.56, y: 0.46 },
      { x: 0.57, y: 0.45 },
      { x: 0.56, y: 0.44 },
    ]);

    await buildingPage.clickNext();

    await buildingPage.drawGateInsidePolygonRelative({
      x: 0.56,
      y: 0.45,
    });

    await buildingPage.clickNext();
    // Select ONE surrounding road
    await buildingPage.selectRoadAt(299, 308);
    await buildingPage.clickNext();

    await buildingPage.clickNext();

    await buildingPage.clickNext();

    // Step 3: Other dropdowns
    await buildingPage.selectDropdown(
      buildingPage.registrationType,
      "Registered and completed",
    );
    await buildingPage.selectDropdown(buildingPage.structureType, "Framed");
    await buildingPage.selectDropdown(buildingPage.roofType, "RCC");

    await buildingPage.fillPlinthArea("0");

    await buildingPage.selectDropdown(
      buildingPage.buildingUseCategory,
      "Residential",
    );
    await buildingPage.selectDropdown(
      buildingPage.specificBuildingUse,
      "Hospitality",
    );

    // Step 4: Submit
    await buildingPage.submitForm();

    // Success validation
    const toast = buildingPage.page.getByText(/building added successfully/i);
    await expect(toast).toBeVisible({ timeout: 10000 });
  });
});
