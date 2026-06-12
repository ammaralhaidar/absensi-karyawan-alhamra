import { Page } from "@playwright/test";

/**
 * Login using the demo buttons on the login page (localStorage-based).
 * This bypasses Supabase auth for more reliable testing.
 */
export async function demoLogin(page: Page, role: "employee" | "admin" | "kiosk_security") {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.waitForSelector('button:has-text("Karyawan")', { timeout: 5000 });
  
  const labels: Record<string, string> = {
    employee: "Karyawan",
    admin: "Admin",
    kiosk_security: "Security",
  };
  
  await page.click(`button:has-text("${labels[role]}")`);
  
  // Wait for redirect
  await page.waitForURL(u => u.pathname !== "/login", { timeout: 10000 });
  await page.waitForLoadState("networkidle", { timeout: 10000 });
  await page.waitForTimeout(2000);
}

export const accounts = {
  employee: { email: "karyawan@ibsalhamra.sch.id", password: "123" },
  kiosk: { email: "kiosk@ibsalhamra.sch.id", password: "123" },
  admin: { email: "admin@ibsalhamra.sch.id", password: "AlHamra24Mlg" },
  hr: { email: "hr@ibsalhamra.sch.id", password: "123" },
};
