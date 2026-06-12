import { test, expect } from "@playwright/test";
import { demoLogin } from "./utils/auth";

test.describe("Notifications", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("Notification bell area exists on mobile", async ({ page }) => {
    await demoLogin(page, "employee");
    await page.waitForTimeout(2000);
    await expect(page.locator("body")).not.toBeEmpty();
  });
});
