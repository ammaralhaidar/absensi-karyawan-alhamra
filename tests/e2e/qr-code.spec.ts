import { test, expect } from "@playwright/test";
import { demoLogin } from "./utils/auth";
import { cleanupTestData } from "./utils/supabase";

test.describe("QR Code Generation", () => {
  test.beforeEach(async () => {
    await cleanupTestData();
  });

  test("Dashboard loads after employee login", async ({ page }) => {
    await demoLogin(page, "employee");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("Leaves page loads", async ({ page }) => {
    await demoLogin(page, "employee");
    await page.goto("/leaves", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/leaves/);
  });

  test("Profile page loads", async ({ page }) => {
    await demoLogin(page, "employee");
    await page.goto("/profile", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/profile/);
  });
});
