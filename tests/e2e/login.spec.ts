import { test, expect } from "@playwright/test";
import { demoLogin, accounts } from "./utils/auth";

test.describe("Login Flow", () => {
  test("Employee login (demo) redirects to dashboard", async ({ page }) => {
    await demoLogin(page, "employee");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("Admin login (demo) redirects to admin", async ({ page }) => {
    await demoLogin(page, "admin");
    await expect(page).toHaveURL(/\/admin/);
  });

  test("Kiosk login (demo) redirects to kiosk", async ({ page }) => {
    await demoLogin(page, "kiosk_security");
    await expect(page).toHaveURL(/\/kiosk/);
  });

  test("Forgot password page loads", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    const link = page.locator('a:has-text("Lupa")');
    if (await link.count() > 0) {
      await link.click();
      await page.waitForURL(/\/forgot-password/, { timeout: 5000 });
    }
  });

  test("Change password page accessible", async ({ page }) => {
    const resp = await page.goto("/profile/change-password");
    expect(resp?.status()).toBe(200);
  });
});

test.describe("Login Flow Mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("Employee login on mobile", async ({ page }) => {
    await demoLogin(page, "employee");
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
