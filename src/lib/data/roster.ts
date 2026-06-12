"use server";

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { RosterEntry } from '@/types'

export async function getRoster(
  startDate: string,
  endDate: string
): Promise<RosterEntry[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('rosters')
    .select('*, employees!inner(name, departments!inner(name)), shifts(name)')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date')

  if (error) throw new Error(error.message)

  return (data ?? []).map(r => ({
    ...r,
    employee_name: Array.isArray(r.employees) ? r.employees[0]?.name ?? '' : (r.employees as { name: string })?.name ?? '',
    department_name: Array.isArray(r.employees) ? (r.employees[0] as { departments?: { name: string } })?.departments?.name ?? '' : '',
    shift_name: Array.isArray(r.shifts) ? r.shifts[0]?.name ?? '' : (r.shifts as { name: string })?.name ?? '',
  })) as RosterEntry[]
}

export async function updateRoster(
  employeeId: string,
  date: string,
  shiftId: string | null
) {
  const supabase = await createClient()

  if (shiftId === null) {
    const { error } = await supabase
      .from('rosters')
      .delete()
      .eq('employee_id', employeeId)
      .eq('date', date)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase
      .from('rosters')
      .upsert({
        employee_id: employeeId,
        date,
        shift_id: shiftId,
      }, { onConflict: 'employee_id,date' })
    if (error) throw new Error(error.message)
  }

  revalidatePath('/admin/roster')
}
