export type Role = 'employee' | 'admin' | 'kiosk_security';

export type LeaveType = 'cuti_tahunan' | 'sakit' | 'izin';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export type AttendanceStatus = 'tepat_waktu' | 'terlambat';

export type AnomalyFlag = 'lupa_checkout' | 'sistem_auto_close' | null;

export interface Employee {
  id: string;
  nik: string;
  name: string;
  department_id: string;
  department_name: string;
  default_shift_id: string;
  shift_name: string;
  role: Role;
  phone: string;
  email: string;
  joined_at: string;
  is_active: boolean;
  avatar_url?: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
}

export interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  late_tolerance_minutes: number;
  is_default: boolean;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
  attachment_url?: string;
  status: LeaveStatus;
  created_at: string;
}

export interface AttendanceLog {
  id: string;
  employee_id: string;
  employee_name: string;
  department_name: string;
  date: string;
  shift_name: string;
  shift_start: string;
  shift_end: string;
  check_in: string | null;
  check_out: string | null;
  status_in: AttendanceStatus | null;
  anomaly_flag: AnomalyFlag;
}

export interface ScanRecord {
  id: string;
  employee_name: string;
  avatar_url?: string;
  scanned_at: string;
  status: 'tepat_waktu' | 'terlambat' | 'expired' | 'error';
  type: 'check_in' | 'check_out';
}

export interface RosterEntry {
  id: string;
  employee_id: string;
  employee_name: string;
  department_name: string;
  date: string;
  shift_id: string;
  shift_name: string;
}

export interface MonthlyReport {
  employee_id: string;
  employee_name: string;
  department_name: string;
  days: Record<string, string>; // 'H', 'S', 'I', 'C', 'A', 'T'
  total_hadir: number;
  total_sakit: number;
  total_izin: number;
  total_cuti: number;
  total_alpa: number;
  total_terlambat: number;
  total_jam_kerja: number;
}

export type AdminActivityType = 'scan' | 'approval' | 'leave_request' | 'employee_update';

export interface AdminActivity {
  id: string;
  type: AdminActivityType;
  description: string;
  user_name: string;
  timestamp: string;
  link?: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  link?: string;
}

export interface StatItem {
  label: string;
  value: number;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export interface DepartmentStat {
  department_id: string;
  department_name: string;
  total_karyawan: number;
  hadir: number;
  sakit: number;
  izin: number;
  cuti: number;
  alpa: number;
}
