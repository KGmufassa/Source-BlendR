import { expect, test } from "@playwright/test";

test.describe("release-critical workflows", () => {
  test("launch routes expose primary workflow states", async ({ page }) => {
    await page.goto("/imports/demo-import");
    await expect(page.getByRole("heading", { name: "Import review" })).toBeVisible();
    await expect(page.getByRole("button", { name: /commit valid assets/i })).toBeDisabled();
    await expect(page.getByText(/unit cost is mapped/i)).toBeVisible();

    await page.goto("/assets");
    await expect(page.getByRole("heading", { name: "Asset library" })).toBeVisible();
    await expect(page.getByRole("row", { name: /left chest embroidery/i })).toContainText("Missing costs");
    await expect(page.getByRole("button", { name: /add to quote/i }).first()).toBeVisible();

    await page.goto("/pricing");
    await expect(page.getByRole("heading", { name: "Pricing workspace" })).toBeVisible();
    await expect(page.getByText(/low margin: the preview/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /approve price/i })).toBeDisabled();

    await page.goto("/offerings/demo-offering");
    await expect(page.getByRole("heading", { name: "Bundle and recipe builder" })).toBeVisible();
    await expect(
      page.getByRole("complementary", { name: /publish readiness/i }).getByRole("button", { name: /publish offering/i })
    ).toBeDisabled();
    await expect(page.getByText(/resolve missing component costs/i)).toBeVisible();

    await page.goto("/quotes");
    await expect(page.getByRole("heading", { name: "Quotes" })).toBeVisible();
    await expect(page.getByRole("button", { name: /generate pdf/i })).toBeDisabled();
    await expect(page.getByText("Revoked")).toBeVisible();

    await page.goto("/status");
    await expect(page.getByRole("heading", { name: "Status center" })).toBeVisible();
    await expect(page.getByRole("region", { name: /failed jobs/i })).toContainText("JOB-9821");
    await expect(page.getByRole("button", { name: /retry job/i })).toBeEnabled();
  });

  test("keyboard users can reach launch-critical actions and details", async ({ page }) => {
    await page.goto("/quotes");
    await page.getByRole("spinbutton", { name: /premium tee with front dtf quantity/i }).focus();
    await page.keyboard.press("ControlOrMeta+A");
    await page.keyboard.type("60");
    await expect(page.getByRole("spinbutton", { name: /premium tee with front dtf quantity/i })).toHaveValue("60");

    await page.goto("/status");
    await page.getByRole("button", { name: "JOB-9819" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("complementary", { name: /job detail/i })).toContainText("SUP-1039");
    await expect(page.getByRole("button", { name: /retry job/i })).toBeDisabled();
  });

  test("public UI does not expose obvious secret patterns", async ({ page }) => {
    for (const route of ["/quotes", "/status"]) {
      await page.goto(route);
      const bodyText = await page.locator("body").innerText();
      expect(bodyText).not.toMatch(/sk-[A-Za-z0-9]/);
      expect(bodyText).not.toMatch(/password=/i);
      expect(bodyText).not.toMatch(/token=/i);
    }
  });
});
