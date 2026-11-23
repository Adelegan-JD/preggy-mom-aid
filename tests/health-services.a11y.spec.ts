import { expect, test } from "@playwright/test";

test("emergency support exposes the national emergency call action and safety boundary", async ({ page }) => {
  await page.goto("/emergency");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator('a[href="tel:112"]')).toBeVisible();
  await expect(page.getByRole("main").getByText(/not an emergency service|no be emergency service/i)).toBeVisible();
});

test("public hospital directory does not invent facility records when empty", async ({ page }) => {
  await page.goto("/hospitals");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("form")).toBeVisible();
  const cards = page.locator(".health-facility-card");
  if (await cards.count() === 0) {
    await expect(page.getByText(/no facilities|no hospital don enter/i)).toBeVisible();
  }
});
