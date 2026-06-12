"use server";

import { createClient } from '@/lib/supabase/server'
import { employees as dummyEmployees, departments as dummyDepartments, shifts as dummyShifts, leaveRequests as dummyLeaves, holidays as dummyHolidays, adminActivities as dummyActivities, notifications as dummyNotifications, rosterJune as dummyRoster, monthlyReports as dummyReports, recentScans as dummyScans } from '@/lib/dummy-data'
import { getEmployees as supabaseGetEmployees, getAllEmployees as supabaseGetAllEmployees, getEmployee as supabaseGetEmployee } from './employees'
import { getDepartments as supabaseGetDepartments } from './departments'
import { getShifts as supabaseGetShifts } from './shifts'
import { getLeaveRequests as supabaseGetLeaveRequests, getEmployeeLeaveRequests as supabaseGetEmployeeLeaveRequests } from './leaves'
import { getAttendanceLogs as supabaseGetAttendanceLogs, getTodayAttendance as supabaseGetTodayAttendance } from './attendance'
import { getRoster as supabaseGetRoster } from './roster'
import { getAdminActivities as supabaseGetAdminActivities } from './activities'
import type { Employee, Department, Shift, LeaveRequest, AttendanceLog, RosterEntry, AdminActivity, Notification, ScanRecord, MonthlyReport } from '@/types'

// Helper to safely call Supabase, fallback to dummy
async function safeFetch<T>(supabaseFn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await supabaseFn()
  } catch {
    return fallback
  }
}

// Employees
export async function getEmployees(): Promise<Employee[]> {
  return safeFetch(() => supabaseGetEmployees(), [...dummyEmployees])
}

export async function getAllEmployees(): Promise<Employee[]> {
  return safeFetch(() => supabaseGetAllEmployees(), [...dummyEmployees])
}

export async function getEmployee(id: string): Promise<Employee | null> {
  return safeFetch(() => supabaseGetEmployee(id), dummyEmployees.find(e => e.id === id) ?? null)
}

// Departments
export async function getDepartments(): Promise<Department[]> {
  return safeFetch(() => supabaseGetDepartments(), [...dummyDepartments])
}

// Shifts
export async function getShifts(): Promise<Shift[]> {
  return safeFetch(() => supabaseGetShifts(), [...dummyShifts])
}

// Leave Requests
export async function getLeaveRequests(): Promise<LeaveRequest[]> {
  return safeFetch(() => supabaseGetLeaveRequests(), [...dummyLeaves])
}

export async function getEmployeeLeaveRequests(employeeId: string): Promise<LeaveRequest[]> {
  return safeFetch(() => supabaseGetEmployeeLeaveRequests(employeeId), dummyLeaves.filter(l => l.employee_id === employeeId))
}

// Attendance
export async function getAttendanceLogs(employeeId?: string, date?: string): Promise<AttendanceLog[]> {
  return safeFetch(() => supabaseGetAttendanceLogs(employeeId, date), [])
}

export async function getTodayAttendance(): Promise<AttendanceLog[]> {
  return safeFetch(() => supabaseGetTodayAttendance(), [])
}

// Roster
export async function getRoster(startDate: string, endDate: string): Promise<RosterEntry[]> {
  return safeFetch(() => supabaseGetRoster(startDate, endDate), [...dummyRoster])
}

// Admin Activities
export async function getAdminActivities(): Promise<AdminActivity[]> {
  return safeFetch(() => supabaseGetAdminActivities(), [...dummyActivities])
}

// Notifications
export async function getNotifications(): Promise<Notification[]> {
  return safeFetch(async () => {
    const supabase = await createClient()
    const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false })
    return (data ?? []) as Notification[]
  }, [...dummyNotifications])
}

// Scan Records
export async function getScanRecords(): Promise<ScanRecord[]> {
  return safeFetch(async () => {
    const supabase = await createClient()
    const { data } = await supabase.from('scan_records').select('*').order('scanned_at', { ascending: false }).limit(50)
    return (data ?? []) as ScanRecord[]
  }, [...dummyScans])
}

// Reports
export async function getReports(): Promise<MonthlyReport[]> {
  return safeFetch(async () => {
    const supabase = await createClient()
    const { data } = await supabase.from('attendance_logs')
      .select('*, employees(name, department_id, departments(name)), shifts(name)')
      .order('date', { ascending: false })
    
    // Transform to MonthlyReport format
    return (data ?? []).map((a: Record<string, unknown>) => ({
      employee_id: a.employee_id as string,
      employee_name: (a.employees as { name: string })?.name ?? '',
      department_name: (a.employees as { departments?: { name: string } })?.departments?.name ?? '',
      days: {} as Record<string, string>,
      total_hadir: 0,
      total_sakit: 0,
      total_izin: 0,
      total_cuti: 0,
      total_alpa: 0,
      total_terlambat: 0,
      total_jam_kerja: 0,
    })) as MonthlyReport[]
  }, [...dummyReports])
}

// Holidays
export async function getHolidays(): Promise<{ date: string; name: string; type: string }[]> {
  return safeFetch(async () => {
    const supabase = await createClient()
    const { data } = await supabase.from('holidays').select('*').order('date')
    return (data ?? []) as { date: string; name: string; type: string }[]
  }, [...dummyHolidays])
}
