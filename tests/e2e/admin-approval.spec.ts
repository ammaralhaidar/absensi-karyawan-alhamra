import { test, expect } from "@playwright/test";
import { demoLogin } from "./utils/auth";
import { cleanupTestData, supabase } from "./utils/supabase";

test.describe("Admin Approval Flow", () => {
  test.beforeEach(async () => {
    await cleanupTestData();
    const { data: emp } = await supabase.from("employees").select("id").eq("email", "karyawan@ibsalhamra.sch.id").single();
    if (emp) {
      await supabase.from("leave_requests").insert({
        employee_id: emp.id,
        leave_type: "sakit",
        start_date: "2026-06-15",
        end_date: "2026-06-16",
        reason: "Sakit demo E2E test",
        status: "pending",
      });
    }
  });

  test.afterEach(async () => {
    await cleanupTestData();
  });

  test("Approval page loads", async ({ page }) => {
    await demoLogin(page, "admin");
    await page.goto("/admin/approvals", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    await expect(page.locator("body")).not.toBeEmpty();
  });
});
