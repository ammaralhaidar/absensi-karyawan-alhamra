import { test, expect } from "@playwright/test";
import { demoLogin } from "./utils/auth";

test.describe("Excel Export", () => {
  test("Reports page loads", async ({ page }) => {
    await demoLogin(page, "admin");
    await page.goto("/admin/reports", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    await expect(page.locator("body")).not.toBeEmpty();
  });
});
