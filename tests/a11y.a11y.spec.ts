import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { chooseOption } from "./helpers";

const publicAndAccountRoutes = [
  "/",
  "/learn",
  "/login",
  "/signup",
  "/feedback",
  "/my-care",
  "/my-care/settings",
];

for (const route of publicAndAccountRoutes) {
  test(`${route} has an accessible main landmark and skip navigation`, async ({ page }) => {
    await page.goto(route);

    const main = page.locator("main#main-content");
    await expect(main).toHaveCount(1);

    const skipLink = page.getByRole("link", { name: "Skip to main content" });
    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(main).toBeFocused();
  });

  test(`${route} passes automated WCAG 2.2 AA axe checks`, async ({ page }) => {
    // Scan settled content: scroll-reveal fades are mid-transition otherwise.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const violations = results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      targets: violation.nodes.slice(0, 5).map((node) => node.target),
    }));

    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });
}

test("mobile navigation opens, closes with Escape, and returns focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const menuButton = page.locator('button[aria-controls="primary-navigation"]');
  await menuButton.click();
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
});

test("display preferences can be changed and persist on this device", async ({ page }) => {
  await page.goto("/");
  await page.getByText("Language & display", { exact: true }).click();

  await chooseOption(page, "Colour theme", "Dark");
  await chooseOption(page, "Accent colour", "Blue");
  await chooseOption(page, "Text size", "Extra large");
  await chooseOption(page, "Contrast", "High contrast");
  await chooseOption(page, "Motion", "Reduce motion");
  await chooseOption(page, "Content width", "Wider layout");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-accent", "blue");
  await expect(page.locator("html")).toHaveAttribute("data-text-size", "largest");
  await expect(page.locator("html")).toHaveAttribute("data-contrast", "high");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
  await expect(page.locator("html")).toHaveAttribute("data-layout", "wide");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-accent", "blue");

  await page.getByText("Language & display", { exact: true }).click();
  await page.getByRole("button", { name: "Restore defaults" }).click();
  // "Use my device setting" resolves to the device's concrete light/dark scheme.
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("landing page reflows at 320 CSS pixels without horizontal page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    page: document.documentElement.scrollWidth,
  }));
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport);
});
