import { test, expect } from "@playwright/test";
import { cleanupTestData, getEmployeeIdByEmail, generateQRToken, supabase } from "./utils/supabase";

const today = () => new Date().toISOString().split("T")[0];

test.describe.serial("Kiosk Scanner Flow (API)", () => {
  test.beforeEach(async () => {
    await cleanupTestData();
  });

  test.afterEach(async () => {
    await cleanupTestData();
  });

  test("QR token generation and validation works", async ({ request }) => {
    const empId = await getEmployeeIdByEmail("karyawan@ibsalhamra.sch.id");
    expect(empId).toBeTruthy();
    
    const token = await generateQRToken(empId, "check_in");
    expect(token).toBeTruthy();
    
    const resp = await request.post("/api/qr-validate", {
      data: { token, kiosk_id: "kiosk-test" }
    });
    const data = await resp.json();
    
    // Response can be either success or error (if already checked in today)
    expect(data).toHaveProperty("success");
    expect(data.success).toBe(true);
    expect(data.status).toBe("tepat_waktu");
  });

  test("Check-out flow works", async ({ request }) => {
    const empId = await getEmployeeIdByEmail("karyawan@ibsalhamra.sch.id");
    
    // Check-in first
    const token1 = await generateQRToken(empId, "check_in");
    await request.post("/api/qr-validate", {
      data: { token: token1, kiosk_id: "kiosk-test" }
    });
    
    // Check-out
    const token2 = await generateQRToken(empId, "check_out");
    const resp = await request.post("/api/qr-validate", {
      data: { token: token2, kiosk_id: "kiosk-test" }
    });
    const data = await resp.json();
    expect(data.success).toBe(true);
    expect(data.status).toBe("check_out");
  });

  test("Duplicate check-out is rejected", async ({ request }) => {
    const empId = await getEmployeeIdByEmail("karyawan@ibsalhamra.sch.id");
    
    // Check-in
    const t1 = await generateQRToken(empId, "check_in");
    await request.post("/api/qr-validate", { data: { token: t1, kiosk_id: "kiosk-test" } });
    
    // Check-out
    const t2 = await generateQRToken(empId, "check_out");
    await request.post("/api/qr-validate", { data: { token: t2, kiosk_id: "kiosk-test" } });
    
    // Duplicate check-out
    const t3 = await generateQRToken(empId, "check_out");
    const resp = await request.post("/api/qr-validate", { data: { token: t3, kiosk_id: "kiosk-test" } });
    expect(resp.status()).toBeGreaterThanOrEqual(400);
  });
});
