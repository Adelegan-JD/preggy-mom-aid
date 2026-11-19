import { expect, test } from "@playwright/test";

test("nearby hospitals module offers manual search without requiring GPS", async ({ page }) => {
  await page.goto("/hospitals");
  await expect(page.getByRole("heading", { name: /nearby hospitals/i })).toBeVisible();
  const search = page.locator("#nearby-hospital-search");
  await expect(search).toBeVisible();
  await search.fill("Sapele");
  await expect(page.getByText(/TEST ONLY — NOT REAL/i)).toHaveCount(0);
});

test("nearby hospitals provides a manual fallback when location permission is denied", async ({ page }) => {
  await page.addInitScript(() => {
    const denied = { code: 1, PERMISSION_DENIED: 1 };
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: { getCurrentPosition: (_success: unknown, onError: (error: typeof denied) => void) => onError(denied) },
    });
  });
  await page.goto("/hospitals");
  await page.getByRole("button", { name: /use my location/i }).click();
  await expect(page.getByText(/location permission was not granted/i)).toBeVisible();
  await expect(page.locator("#nearby-hospital-search")).toBeVisible();
});
