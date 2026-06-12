import { test, expect } from "@playwright/test";
import { demoLogin } from "./utils/auth";
import { cleanupTestData, supabase } from "./utils/supabase";

const today = () => new Date().toISOString().split("T")[0];

test.describe("Anomaly Dashboard", () => {
  test.beforeEach(async () => {
    await cleanupTestData();
    const { data: emp } = await supabase.from("employees").select("id").eq("email", "karyawan@ibsalhamra.sch.id").single();
    if (emp) {
      await supabase.from("attendance_logs").insert({
        employee_id: emp.id,
        date: today(),
        shift_id: "3330bd8f-0000-0000-0000-000000000000",
        check_in: new Date().toISOString(),
        check_out: null,
        status_in: "tepat_waktu",
        anomaly_flag: "lupa_checkout",
      });
    }
  });

  test.afterEach(async () => {
    await cleanupTestData();
  });

  test("Admin dashboard loads", async ({ page }) => {
    await demoLogin(page, "admin");
    await page.waitForTimeout(2000);
    await expect(page.locator("body")).not.toBeEmpty();
  });
});
