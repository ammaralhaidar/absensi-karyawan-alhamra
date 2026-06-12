import { createClient } from "@supabase/supabase-js";

const url = "https://wyewqgyldltujjunmfmp.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5ZXdxZ3lsZGx0dWpqdW5tZm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTE0MTY2NiwiZXhwIjoyMDk2NzE3NjY2fQ.I4oM8bcq6JghzlGpHk0olx0ulFjzeVVbO5ggIpMS41E";

export const supabase = createClient(url, key);

const today = () => new Date().toISOString().split("T")[0];

export async function cleanupTestData() {
  // Delete test leave requests
  const { data: emp } = await supabase.from("employees").select("id").eq("email", "karyawan@ibsalhamra.sch.id").single();
  if (emp) {
    await supabase.from("leave_requests").delete().eq("employee_id", emp.id).eq("reason", "Sakit demo E2E test");
  }
  // Delete test attendance logs for today (not null IDs)
  const { data: logs } = await supabase.from("attendance_logs").select("id").eq("date", today());
  if (logs) {
    for (const log of logs) {
      await supabase.from("attendance_logs").delete().eq("id", log.id);
    }
  }
}

export async function generateQRToken(employeeId: string, type: string = "check_in") {
  const resp = await fetch(`${url}/functions/v1/qr-generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({ employee_id: employeeId, type }),
  });
  const data = await resp.json();
  return data.token;
}

export async function getEmployeeIdByEmail(email: string) {
  const { data } = await supabase.from("employees").select("id").eq("email", email).single();
  return data?.id;
}
