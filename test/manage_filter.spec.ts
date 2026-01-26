import { test, expect } from "@playwright/test";
import { FilterPage } from "../pages/ManageFilterPage";

const chartTypes = [
  "bar",
  "donut",
  "horizontalBar",
  "stackedChart",
  "scatterChart",
];

test.describe("Filter Module", () => {
  let filterPage: FilterPage;

  test.beforeEach(async ({ page }) => {
    filterPage = new FilterPage(page);
    await page.goto("/setting/manage-filter");
  });

  test("TC-01: Create a filter, search it, and delete it", async ({ page }) => {
    const filterName = `test ${Math.floor(Math.random() * 1000)}`;
    const layerName = "ram test";

    await filterPage.clickAddNewFilter();
    await filterPage.selectFilterType("Filter 1");
    await filterPage.enterFilterName(filterName);
    await filterPage.selectLayer(layerName);
    await filterPage.setCondition("governmental");
    await filterPage.previewTable();
    await filterPage.selectRows([1, 2, 3]);
    await filterPage.saveFilter();

    const row = await filterPage.searchFilter(filterName);
    await expect(row).toBeVisible({ timeout: 10000 });

    const successMsg = await filterPage.deleteFilter(filterName);
    await expect(successMsg).toBeVisible({ timeout: 10000 });

    const noDataVisible = await filterPage.isNoDataFoundVisible();
    expect(noDataVisible).toBe(true);
  });

  test("TC-02: Create filter with empty name should show validation error", async ({
    page,
  }) => {
    await filterPage.clickAddNewFilter();
    await filterPage.selectFilterType("Filter 1");
    await filterPage.enterFilterName(""); // empty
    await filterPage.selectLayer("ram test");
    await filterPage.setCondition("governmental");
    await filterPage.previewTable();
    await filterPage.saveFilter();

    const error = page.getByText("Required", { exact: true });
    await expect(error).toBeVisible();
  });
  // test("TC-04: Search filter by name", async ({ page }) => {
  //   const filterPage = new FilterPage(page);
  //   const filterName = `search-test-${Math.floor(Math.random() * 1000)}`;

  //   // Create a filter
  //   await filterPage.clickAddNewFilter();
  //   await filterPage.selectFilterType("Filter 1");
  //   await filterPage.enterFilterName(filterName);
  //   await filterPage.selectLayer("ram test");
  //   await filterPage.setCondition("governmental");
  //   await filterPage.previewTable();
  //   await filterPage.selectRows([1, 2]);
  //   await filterPage.saveFilter();

  //   // Search for the filter
  //   const row = await filterPage.searchFilter(filterName);
  //   await expect(row).toBeVisible({ timeout: 10000 });

  //   // Search for non-existing filter
  //   const notFoundRow = await filterPage.searchFilter("non-existing-filter");
  //   expect(await filterPage.isNoDataFoundVisible()).toBe(true);

  //   // Clean up
  //   await filterPage.deleteFilter(filterName);
  // });

  // test("TC-05: Cancel filter creation", async ({ page }) => {
  //   const filterPage = new FilterPage(page);
  //   const filterName = `cancel-test-${Math.floor(Math.random() * 1000)}`;

  //   await filterPage.clickAddNewFilter();
  //   await filterPage.selectFilterType("Filter 1");
  //   await filterPage.enterFilterName(filterName);
  //   await filterPage.selectLayer("ram test");
  //   await filterPage.setCondition("governmental");

  //   // Cancel instead of saving
  //   await page.getByRole("button", { name: "Cancel" }).click();

  //   // Verify filter is not added
  //   await filterPage.searchFilter(filterName);
  //   expect(await filterPage.isNoDataFoundVisible()).toBe(true);
  // });

  test.describe.parallel("Filter Module - Chart Filters", () => {
    chartTypes.forEach((chart) => {
      test(`TC-03: Create filter for ${chart}, search, and delete`, async ({
        page,
      }) => {
        const filterPage = new FilterPage(page);
        const filterName = `filter2-${chart}`;
        const layerName = "ram test";

        await page.goto("/setting/manage-filter");

        // --- Create Filter ---
        await filterPage.clickAddNewFilter();
        await filterPage.selectFilterType("Filter 2");
        await filterPage.enterFilterName(filterName);
        await filterPage.selectLayer(layerName);
        await filterPage.selectType();

        // --- Generate Chart ---
        await page.getByRole("button", { name: "Generate Chart" }).click();

        // --- Click chart-specific info ---
        await page
          .locator(
            "div.head p.w-full.text-base.font-bold.capitalize.text-grey-800",
            { hasText: chart },
          )
          .first()
          .click();

        // --- Save Filter ---
        await filterPage.saveFilter();
        const successMsg = page.getByText(
          /SuccessNew Filter Added Successfully/i,
        );
        await expect(successMsg).toBeVisible({ timeout: 10000 });
        await successMsg.click();

        // --- Search & Verify ---
        const row = await filterPage.searchFilter(filterName);
        await expect(row).toBeVisible({ timeout: 10000 });

        // --- Delete ---
        const deleteMsg = await filterPage.deleteFilter(filterName);
        await expect(deleteMsg).toBeVisible({ timeout: 10000 });

        const noDataVisible = await filterPage.isNoDataFoundVisible();
        expect(noDataVisible).toBe(true);
      });
    });
  });
});
