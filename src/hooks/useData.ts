"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Employee, Department, Shift, LeaveRequest, AttendanceLog, RosterEntry, AdminActivity, Notification, ScanRecord, MonthlyReport } from "@/types";

export function useEmployees() {
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.from('employees')
      .select('id, nik, name, email, phone, department_id, departments(name), default_shift_id, shifts(name), role, avatar_url, joined_at, is_active')
      .eq('is_active', true)
      .order('name')
      .then(({ data, error }) => {
        if (!error && data) {
          setData(data.map((e: Record<string, unknown>) => ({
            ...e,
            department_name: Array.isArray(e.departments) ? (e.departments[0] as { name: string })?.name ?? '' : (e.departments as { name: string })?.name ?? '',
            shift_name: Array.isArray(e.shifts) ? (e.shifts[0] as { name: string })?.name ?? '' : (e.shifts as { name: string })?.name ?? '',
          })) as Employee[]);
        }
        setLoading(false);
      });
  }, [supabase]);

  return { data, loading };
}

export function useDepartments() {
  const [data, setData] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.from('departments').select('*').order('name').then(({ data, error }) => {
      if (!error && data) setData(data as Department[]);
      setLoading(false);
    });
  }, [supabase]);

  return { data, loading };
}

export function useShifts() {
  const [data, setData] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.from('shifts').select('*').order('name').then(({ data, error }) => {
      if (!error && data) setData(data as Shift[]);
      setLoading(false);
    });
  }, [supabase]);

  return { data, loading };
}

export function useLeaveRequests() {
  const [data, setData] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.from('leave_requests')
      .select('*, employees(name)')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setData(data.map((l: Record<string, unknown>) => ({
            ...l,
            employee_name: Array.isArray(l.employees) ? (l.employees[0] as { name: string })?.name ?? '' : (l.employees as { name: string })?.name ?? '',
          })) as LeaveRequest[]);
        }
        setLoading(false);
      });
  }, [supabase]);

  return { data, loading };
}

export function useTodayAttendance() {
  const [data, setData] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    supabase.from('attendance_logs')
      .select('*')
      .eq('date', today)
      .then(({ data, error }) => {
        if (!error && data) setData(data as AttendanceLog[]);
        setLoading(false);
      });
  }, [supabase]);

  return { data, loading };
}

export function useAdminActivities() {
  const [data, setData] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.from('admin_activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (!error && data) {
          setData(data.map((a: Record<string, unknown>) => ({
            ...a,
            timestamp: a.created_at as string,
          })) as AdminActivity[]);
        }
        setLoading(false);
      });
  }, [supabase]);

  return { data, loading };
}

export function useNotifications() {
  const [data, setData] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        if (!error && data) setData(data as Notification[]);
        setLoading(false);
      });
  }, [supabase]);

  return { data, loading };
}

export function useReports(month?: string, year?: string) {
  const [data, setData] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const today = new Date();
    const targetMonth = month ? parseInt(month) - 1 : today.getMonth();
    const targetYear = year ? parseInt(year) : today.getFullYear();
    const startOfMonth = new Date(targetYear, targetMonth, 1).toISOString().split('T')[0];
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0).toISOString().split('T')[0];
    
    supabase.from('attendance_logs')
      .select('*, employees(name, department_id, departments(name))')
      .gte('date', startOfMonth)
      .lte('date', endOfMonth)
      .order('date', { ascending: true })
      .then(({ data: logs, error }) => {
        if (!error && logs) {
          const employeeMap = new Map<string, MonthlyReport>();
          
          (logs as Record<string, unknown>[]).forEach((log) => {
            const empId = log.employee_id as string;
            const day = String(new Date(log.date as string).getDate());
            
            if (!employeeMap.has(empId)) {
              employeeMap.set(empId, {
                employee_id: empId,
                employee_name: (log.employees as { name: string })?.name ?? '',
                department_name: (log.employees as { departments?: { name: string } })?.departments?.name ?? '',
                days: {},
                total_hadir: 0,
                total_sakit: 0,
                total_izin: 0,
                total_cuti: 0,
                total_alpa: 0,
                total_terlambat: 0,
                total_jam_kerja: 0,
              });
            }
            
            const report = employeeMap.get(empId)!;
            const statusIn = log.status_in as string | null;
            const anomaly = log.anomaly_flag as string | null;
            
            let code = 'A';
            if (statusIn === 'tepat_waktu') code = 'H';
            else if (statusIn === 'terlambat') code = 'T';
            else if (anomaly === 'sakit') code = 'S';
            else if (anomaly === 'izin') code = 'I';
            else if (anomaly === 'cuti') code = 'C';
            
            report.days[day] = code;
            report.total_hadir += (statusIn === 'tepat_waktu' ? 1 : 0);
            report.total_terlambat += (statusIn === 'terlambat' ? 1 : 0);
            report.total_alpa += (statusIn === null && !anomaly ? 1 : 0);
            
            if (log.check_in && log.check_out) {
              const checkIn = new Date(`2000-01-01T${log.check_in}`);
              const checkOut = new Date(`2000-01-01T${log.check_out}`);
              const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
              report.total_jam_kerja += Math.max(0, hours);
            }
          });
          
          setData(Array.from(employeeMap.values()));
        }
        setLoading(false);
      });
  }, [supabase, month, year]);

  return { data, loading };
}

export function useMonthlyStats(employeeId?: string) {
  const [data, setData] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!employeeId) {
      setLoading(false);
      return;
    }
    
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    
    supabase.from('attendance_logs')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('date', startOfMonth)
      .lte('date', endOfMonth)
      .then(({ data: logs, error }) => {
        if (!error && logs) {
          const report: MonthlyReport = {
            employee_id: employeeId,
            employee_name: '',
            department_name: '',
            days: {},
            total_hadir: 0,
            total_sakit: 0,
            total_izin: 0,
            total_cuti: 0,
            total_alpa: 0,
            total_terlambat: 0,
            total_jam_kerja: 0,
          };
          
          (logs as Record<string, unknown>[]).forEach((log) => {
            const statusIn = log.status_in as string | null;
            const anomaly = log.anomaly_flag as string | null;
            
            report.total_hadir += (statusIn === 'tepat_waktu' ? 1 : 0);
            report.total_terlambat += (statusIn === 'terlambat' ? 1 : 0);
            report.total_sakit += (anomaly === 'sakit' ? 1 : 0);
            report.total_izin += (anomaly === 'izin' ? 1 : 0);
            report.total_cuti += (anomaly === 'cuti' ? 1 : 0);
            report.total_alpa += (statusIn === null && !anomaly ? 1 : 0);
            
            if (log.check_in && log.check_out) {
              const checkIn = new Date(`2000-01-01T${log.check_in}`);
              const checkOut = new Date(`2000-01-01T${log.check_out}`);
              const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
              report.total_jam_kerja += Math.max(0, hours);
            }
          });
          
          setData(report);
        }
        setLoading(false);
      });
  }, [supabase, employeeId]);

  return { data, loading };
}

export function useScanRecords() {
  const [data, setData] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.from('scan_records')
      .select('*')
      .order('scanned_at', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (!error && data) setData(data as ScanRecord[]);
        setLoading(false);
      });
  }, [supabase]);

  return { data, loading };
}

export function useRoster(startDate?: string, endDate?: string) {
  const [data, setData] = useState<RosterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let query = supabase.from('rosters').select('*, employees(name, departments(name)), shifts(name)');
    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);
    
    query.then(({ data, error }) => {
      if (!error && data) {
        setData(data.map((r: Record<string, unknown>) => ({
          ...r,
          employee_name: Array.isArray(r.employees) ? (r.employees[0] as { name: string })?.name ?? '' : (r.employees as { name: string })?.name ?? '',
          department_name: Array.isArray(r.employees) ? ((r.employees[0] as { departments?: { name: string } })?.departments?.name ?? '') : '',
          shift_name: Array.isArray(r.shifts) ? (r.shifts[0] as { name: string })?.name ?? '' : (r.shifts as { name: string })?.name ?? '',
        })) as RosterEntry[]);
      }
      setLoading(false);
    });
  }, [supabase, startDate, endDate]);

  return { data, loading };
}
