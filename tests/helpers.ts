import type { Page } from "@playwright/test";

/** Chooses an option from a design-system ComboBox by its label and option text. */
export async function chooseOption(page: Page, label: string | RegExp, option: string | RegExp) {
  await page.getByRole("combobox", { name: label }).first().click();
  await page.getByRole("option", { name: option }).first().click();
}
