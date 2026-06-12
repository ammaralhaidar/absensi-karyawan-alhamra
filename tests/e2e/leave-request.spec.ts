import { test, expect } from "@playwright/test";
import { demoLogin } from "./utils/auth";
import { cleanupTestData } from "./utils/supabase";

test.describe("Leave Request Flow", () => {
  test.beforeEach(async () => {
    await cleanupTestData();
  });

  test("Leaves page loads", async ({ page }) => {
    await demoLogin(page, "employee");
    await page.goto("/leaves", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/leaves/);
    await expect(page.locator("body")).not.toBeEmpty();
  });
});
