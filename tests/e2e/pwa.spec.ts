import { test, expect } from "@playwright/test";

test.describe("PWA Features", () => {
  test("Manifest is accessible", async ({ page }) => {
    const response = await page.goto("/manifest.json");
    expect(response?.status()).toBe(200);
    const text = await response?.text();
    expect(text).toContain("Alhamra Attendance");
    expect(text).toContain("standalone");
  });
});
