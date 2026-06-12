"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function copyRosterFromPreviousMonth(departmentId?: string) {
  const supabase = await createClient();
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const startPrev = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-01`;
  const endPrev = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${new Date(prevYear, prevMonth + 1, 0).getDate()}`;

  const daysInCurrent = new Date(currentYear, currentMonth + 1, 0).getDate();

  let query = supabase
    .from("rosters")
    .select("*")
    .gte("date", startPrev)
    .lte("date", endPrev);

  if (departmentId) {
    query = query.eq("department_id", departmentId);
  }

  const { data: prevRosters, error: fetchError } = await query;

  if (fetchError) throw new Error(fetchError.message);
  if (!prevRosters || prevRosters.length === 0) {
    return { copied: 0, message: "Tidak ada data roster bulan sebelumnya untuk disalin" };
  }

  const newRosters = [];
  for (const entry of prevRosters) {
    const oldDay = new Date(entry.date).getDate();
    if (oldDay <= daysInCurrent) {
      const newDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(oldDay).padStart(2, "0")}`;
      newRosters.push({
        employee_id: entry.employee_id,
        department_id: entry.department_id,
        date: newDate,
        shift_id: entry.shift_id,
      });
    }
  }

  if (newRosters.length === 0) {
    return { copied: 0, message: "Tidak ada tanggal valid untuk disalin" };
  }

  const startCurrent = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`;
  const endCurrent = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${daysInCurrent}`;

  let deleteQuery = supabase
    .from("rosters")
    .delete()
    .gte("date", startCurrent)
    .lte("date", endCurrent);

  if (departmentId) {
    deleteQuery = deleteQuery.eq("department_id", departmentId);
  }

  await deleteQuery;

  const { error: insertError } = await supabase
    .from("rosters")
    .insert(newRosters);

  if (insertError) throw new Error(insertError.message);

  revalidatePath("/admin/roster");

  return { copied: newRosters.length, message: `${newRosters.length} entri roster disalin` };
}
