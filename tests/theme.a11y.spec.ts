import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const hasConfiguredSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

// /my-care redirects anonymous visitors when Supabase is configured. In that
// environment this suite tests the public routes; protected-route tests need
// a dedicated authenticated fixture rather than silently auditing the login page.
const routes = ["/", "/learn", "/login", ...(hasConfiguredSupabase ? [] : ["/my-care"])] as const;
const themes = ["light", "dark"] as const;

for (const theme of themes) {
  for (const route of routes) {
    test(`${route} remains WCAG-readable in ${theme} high-contrast mode`, async ({ page }) => {
      await page.goto(route);
      await page.getByText("Display settings", { exact: true }).click();
      await page.getByLabel("Colour theme").selectOption(theme);
      await page.getByLabel("Contrast").selectOption("high");

      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.locator("html")).toHaveAttribute("data-contrast", "high");

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
}
