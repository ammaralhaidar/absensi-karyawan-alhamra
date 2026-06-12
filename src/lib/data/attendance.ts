"use server";

import { createClient } from '@/lib/supabase/server'
import type { AttendanceLog } from '@/types'

export async function getAttendanceLogs(
  employeeId?: string,
  date?: string
): Promise<AttendanceLog[]> {
  const supabase = await createClient()
  let query = supabase
    .from('attendance_logs')
    .select('*, employees!inner(name, departments!inner(name)), shifts(name)')
    .order('date', { ascending: false })

  if (employeeId) query = query.eq('employee_id', employeeId)
  if (date) query = query.eq('date', date)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  return (data ?? []).map(a => ({
    ...a,
    employee_name: Array.isArray(a.employees) ? a.employees[0]?.name ?? '' : (a.employees as { name: string })?.name ?? '',
    department_name: Array.isArray(a.employees) ? (a.employees[0] as { departments?: { name: string } })?.departments?.name ?? '' : '',
    shift_name: Array.isArray(a.shifts) ? a.shifts[0]?.name ?? '' : (a.shifts as { name: string })?.name ?? '',
    shift_start: '',
    shift_end: '',
  })) as AttendanceLog[]
}

export async function getTodayAttendance(): Promise<AttendanceLog[]> {
  const today = new Date().toISOString().split('T')[0]
  return getAttendanceLogs(undefined, today)
}
