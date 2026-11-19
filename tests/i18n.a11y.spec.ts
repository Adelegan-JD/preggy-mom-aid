import { expect, test } from "@playwright/test";

const hasConfiguredSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

test("patient language selection updates the interface and persists after reload", async ({ page }) => {
  test.skip(hasConfiguredSupabase, "The safe fallback is used here; authenticated locale smoke tests need a dedicated patient fixture.");
  await page.goto("/my-care");

  const language = page.locator(".pma-language-fallback select");
  await expect(language).toHaveValue("en");
  await language.selectOption("yo");

  await expect(page.locator("html")).toHaveAttribute("lang", "yo-NG");
  await expect(page.locator(".pma-language-fallback select")).toHaveValue("yo");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ojú ìṣàkóso ìlera rẹ");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("pma-language-v1"))).toBe("yo");

  await page.reload();
  await expect(page.locator(".pma-language-fallback").getByLabel("Choose language")).toHaveValue("yo");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ojú ìṣàkóso ìlera rẹ");
});
