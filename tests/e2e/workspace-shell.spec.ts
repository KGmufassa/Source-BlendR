import { expect, test } from "@playwright/test";

test("dashboard exposes workflow summary and primary navigation", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page.getByRole("heading", { name: "Operational dashboard" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Workspace navigation" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create supplier" })).toBeVisible();
});
