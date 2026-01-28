import { test, expect, Page } from "@playwright/test";
import { FilterPage } from "../pages/ManageFilterPage";

const chartTypes = [
  "bar",
  "donut",
  "horizontalBar",
  "stackedChart",
  "scatterChart",
];

test.describe.serial("Filter Module - Single Browser Session", () => {
  let page: Page;
  let filterPage: FilterPage;

  // Runs once before all tests
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    filterPage = new FilterPage(page);
    await page.goto("/setting/manage-filter");
  });

  // Reload page between tests to reset state
  test.afterEach(async () => {
    await page.reload();
  });

  /**
   * TC-01: Create a filter, search it, and delete it
   */
  test("TC-01: Create, search, and delete filter", async () => {
    const filterName = `test-${Math.floor(Math.random() * 1000)}`;
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

  /**
   * TC-02: Validation error when filter name is empty
   */
  test("TC-02: Empty filter name validation", async () => {
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

  /**
   * TC-03: Chart-specific filters (bar, donut, etc.)
   */
  chartTypes.forEach((chart) => {
    test(`TC-03: Create, search, and delete filter for ${chart}`, async () => {
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
