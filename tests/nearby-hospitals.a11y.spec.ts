import { expect, test } from "@playwright/test";

test("nearby hospitals module offers manual search without requiring GPS", async ({ page }) => {
  await page.goto("/hospitals");
  await expect(page.getByRole("heading", { name: /nearby hospitals/i })).toBeVisible();
  const search = page.getByRole("textbox", { name: /search town or lga/i });
  await expect(search).toBeVisible();
  await search.fill("Sapele");
  await expect(page.getByText(/no facility records found/i)).toBeVisible();
  await expect(page.getByText(/TEST ONLY — NOT REAL/i)).toHaveCount(0);
});

test("nearby hospitals provides a manual fallback when location permission is denied", async ({ page, context }) => {
  await context.grantPermissions([], { origin: "http://127.0.0.1:3000" }).catch(() => undefined);
  await page.goto("/hospitals");
  await page.getByRole("button", { name: /use my location/i }).click();
  await expect(page.getByText(/location permission was not granted/i)).toBeVisible({ timeout: 5000 });
  await expect(page.getByRole("textbox", { name: /search town or lga/i })).toBeVisible();
});
