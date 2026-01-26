import { Page, Locator } from "@playwright/test";

export class FilterPage {
  readonly page: Page;

  // Locators
  readonly addNewFilterBtn: Locator;
  readonly filterTypeDropdown: Locator;
  readonly filterNameInput: Locator;
  readonly layerDropdown: Locator;
  readonly operatorBtn: Locator;
  readonly previewTableBtn: Locator;
  readonly addFilterBtn: Locator;
  readonly searchFilterInput: Locator;
  readonly generateChartBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.addNewFilterBtn = page.getByRole("button", {
      name: "add नयाँ फिल्टर थप्नुहोस् ",
    });
    this.filterTypeDropdown = page.getByRole("textbox", {
      name: "Select Filter Type",
    });
    this.filterNameInput = page.getByRole("textbox", {
      name: "Enter Filter Name",
    });
    this.layerDropdown = page.getByRole("textbox", { name: "लेयर छान्नुहोस्" });
    this.operatorBtn = page.getByRole("button", { name: "=", exact: true });
    this.previewTableBtn = page.getByRole("button", { name: "Preview Table" });
    this.addFilterBtn = page.getByRole("button", { name: "Add Filter" });
    this.searchFilterInput = page.getByRole("textbox", {
      name: "फिल्टरको नामले खोज्नुहोस्",
    });
    this.generateChartBtn = page.getByRole("button", {
      name: "Generate Chart",
    });
  }

  // --- Basic Actions ---

  async clickAddNewFilter() {
    await this.addNewFilterBtn.click();
  }

  async selectFilterType(type: string) {
    await this.filterTypeDropdown.click();
    await this.page.getByRole("listitem").filter({ hasText: type }).click();
  }

  async enterFilterName(name: string) {
    await this.filterNameInput.fill(name);
  }

  async selectLayer(layerText: string) {
    await this.layerDropdown.click();
    await this.page
      .getByRole("textbox", { name: "लेयर छान्नुहोस्" })
      .fill(layerText);
    const option = this.page
      .getByRole("listitem")
      .filter({ hasText: layerText });
    await option.first().click();
  }

  async setCondition(value: string) {
    await this.page.getByText("Type", { exact: true }).click();
    await this.operatorBtn.click();
    const option = this.page.locator("p.cursor-pointer", { hasText: value });
    await option.first().click();
  }
  async selectType() {
    await this.page.getByText("Type", { exact: true }).click();
  }
  async previewTable() {
    await this.previewTableBtn.click();
    await this.page
      .locator("table tbody tr")
      .first()
      .waitFor({ state: "visible" })
      .catch(() => {});
  }

  async selectRows(rows: number[]) {
    for (const row of rows) {
      const cell = this.page
        .getByRole("cell", { name: row.toString() })
        .first();
      await cell.click();
    }
  }

  async saveFilter() {
    await this.addFilterBtn.click();
  }

  // --- Search & Delete ---

  async searchFilter(name: string) {
    await this.searchFilterInput.fill(name);
    await this.page.keyboard.press("Enter");
    const row = this.page.locator("table tbody tr", { hasText: name }).first();
    await row.waitFor({ state: "visible", timeout: 10000 }).catch(() => {});
    return row;
  }

  async deleteFilter(name: string) {
    const row = this.page.locator("table tbody tr", { hasText: name }).first();
    const deleteBtn = row.getByRole("button", { name: /delete/i });
    await deleteBtn.click();

    const confirmInput = this.page.getByRole("textbox", {
      name: /हटाउनुहोस्/i,
    });
    await confirmInput.fill("delete");

    const confirmBtn = this.page.getByRole("button", {
      name: /delete Confirm/i,
    });
    await confirmBtn.click();

    const successMsg = this.page.getByText(/Filter Deleted Successfully/i);
    return successMsg; // let test assert
  }

  // --- Utilities ---

  async isNoDataFoundVisible() {
    const noDataCell = this.page.getByRole("cell", { name: /No Data found/i });
    return noDataCell.isVisible();
  }

  // --- Chart-specific Actions ---

  /**
   * Generate a chart for the current filter.
   */
  async generateChart(chartType: string) {
    await this.generateChartBtn.click();
    // Click the chart info area by chart type
    const chartLocator = this.page.getByText(new RegExp(chartType, "i"));
    await chartLocator.click();
  }

  /**
   * Create a filter, generate chart, and save with a unique name
   */
  async createFilterWithChart(
    filterName: string,
    layerName: string,
    chartType: string,
    condition: string = "governmental",
    selectedRows: number[] = [1, 2, 3],
  ) {
    await this.clickAddNewFilter();
    await this.selectFilterType("Filter 1");
    await this.enterFilterName(filterName);
    await this.selectLayer(layerName);
    await this.setCondition(condition);
    await this.previewTable();
    await this.selectRows(selectedRows);
    await this.generateChart(chartType);
    await this.saveFilter();
  }
}
