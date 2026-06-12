import { Employee, Department, Shift, LeaveRequest, AttendanceLog, ScanRecord, RosterEntry, MonthlyReport, AdminActivity, Notification, DepartmentStat } from '@/types';

export interface Holiday {
  date: string;
  name: string;
  type: 'national' | 'company';
}

export const holidays: Holiday[] = [
  { date: '2026-06-01', name: 'Hari Lahir Pancasila', type: 'national' },
  { date: '2026-06-08', name: 'Cuti Bersama Idul Adha', type: 'national' },
  { date: '2026-06-09', name: 'Idul Adha', type: 'national' },
];

export const departments: Department[] = [
  { id: 'dept-1', name: 'Web Developer', description: 'Pengembangan dan maintenance website' },
  { id: 'dept-2', name: 'Dapur', description: 'Produksi makanan dan minuman' },
  { id: 'dept-3', name: 'Security', description: 'Keamanan dan ketertiban area' },
  { id: 'dept-4', name: 'HR', description: 'Human Resources dan administrasi' },
];

export const shifts: Shift[] = [
  { id: 'shift-1', name: 'Shift Pagi', start_time: '08:00', end_time: '17:00', late_tolerance_minutes: 15, is_default: true },
  { id: 'shift-2', name: 'Shift Siang', start_time: '12:00', end_time: '21:00', late_tolerance_minutes: 10, is_default: false },
  { id: 'shift-3', name: 'Shift Malam', start_time: '20:00', end_time: '05:00', late_tolerance_minutes: 10, is_default: false },
];

export const employees: Employee[] = [
  { id: 'emp-1', nik: '3201234567890001', name: 'Ahmad Fauzi', department_id: 'dept-1', department_name: 'Web Developer', default_shift_id: 'shift-1', shift_name: 'Shift Pagi', role: 'employee', phone: '081234567890', email: 'ahmad@alhamra.com', joined_at: '2023-01-15', is_active: true },
  { id: 'emp-2', nik: '3201234567890002', name: 'Budi Santoso', department_id: 'dept-1', department_name: 'Web Developer', default_shift_id: 'shift-1', shift_name: 'Shift Pagi', role: 'employee', phone: '081234567891', email: 'budi@alhamra.com', joined_at: '2023-03-10', is_active: true },
  { id: 'emp-3', nik: '3201234567890003', name: 'Citra Lestari', department_id: 'dept-2', department_name: 'Dapur', default_shift_id: 'shift-2', shift_name: 'Shift Siang', role: 'employee', phone: '081234567892', email: 'citra@alhamra.com', joined_at: '2023-06-01', is_active: true },
  { id: 'emp-4', nik: '3201234567890004', name: 'Dedi Pratama', department_id: 'dept-3', department_name: 'Security', default_shift_id: 'shift-3', shift_name: 'Shift Malam', role: 'employee', phone: '081234567893', email: 'dedi@alhamra.com', joined_at: '2023-08-20', is_active: true },
  { id: 'emp-5', nik: '3201234567890005', name: 'Eka Wulandari', department_id: 'dept-4', department_name: 'HR', default_shift_id: 'shift-1', shift_name: 'Shift Pagi', role: 'admin', phone: '081234567894', email: 'eka@alhamra.com', joined_at: '2022-05-10', is_active: true },
  { id: 'emp-6', nik: '3201234567890006', name: 'Fajar Hidayat', department_id: 'dept-1', department_name: 'Web Developer', default_shift_id: 'shift-1', shift_name: 'Shift Pagi', role: 'employee', phone: '081234567895', email: 'fajar@alhamra.com', joined_at: '2024-01-05', is_active: true },
  { id: 'emp-7', nik: '3201234567890007', name: 'Gita Ananda', department_id: 'dept-2', department_name: 'Dapur', default_shift_id: 'shift-2', shift_name: 'Shift Siang', role: 'employee', phone: '081234567896', email: 'gita@alhamra.com', joined_at: '2024-02-14', is_active: true },
  { id: 'emp-8', nik: '3201234567890008', name: 'Hadi Wijaya', department_id: 'dept-3', department_name: 'Security', default_shift_id: 'shift-3', shift_name: 'Shift Malam', role: 'kiosk_security', phone: '081234567897', email: 'hadi@alhamra.com', joined_at: '2024-04-01', is_active: true },
  { id: 'emp-9', nik: '3201234567890009', name: 'Indah Permata', department_id: 'dept-1', department_name: 'Web Developer', default_shift_id: 'shift-1', shift_name: 'Shift Pagi', role: 'employee', phone: '081234567898', email: 'indah@alhamra.com', joined_at: '2024-06-15', is_active: true },
  { id: 'emp-10', nik: '3201234567890010', name: 'Joko Suryanto', department_id: 'dept-2', department_name: 'Dapur', default_shift_id: 'shift-2', shift_name: 'Shift Siang', role: 'employee', phone: '081234567899', email: 'joko@alhamra.com', joined_at: '2024-08-01', is_active: true },
  { id: 'emp-11', nik: '3201234567890011', name: 'Kartika Sari', department_id: 'dept-1', department_name: 'Web Developer', default_shift_id: 'shift-1', shift_name: 'Shift Pagi', role: 'employee', phone: '081234567900', email: 'kartika@alhamra.com', joined_at: '2024-10-01', is_active: true },
  { id: 'emp-12', nik: '3201234567890012', name: 'Lukman Hakim', department_id: 'dept-2', department_name: 'Dapur', default_shift_id: 'shift-2', shift_name: 'Shift Siang', role: 'employee', phone: '081234567901', email: 'lukman@alhamra.com', joined_at: '2025-01-10', is_active: true },
  { id: 'emp-13', nik: '3201234567890013', name: 'Maya Dewi', department_id: 'dept-3', department_name: 'Security', default_shift_id: 'shift-3', shift_name: 'Shift Malam', role: 'employee', phone: '081234567902', email: 'maya@alhamra.com', joined_at: '2025-03-15', is_active: false },
  { id: 'emp-14', nik: '3201234567890014', name: 'Nico Pratomo', department_id: 'dept-4', department_name: 'HR', default_shift_id: 'shift-1', shift_name: 'Shift Pagi', role: 'employee', phone: '081234567903', email: 'nico@alhamra.com', joined_at: '2025-05-20', is_active: true },
  { id: 'emp-15', nik: '3201234567890015', name: 'Olivia Putri', department_id: 'dept-1', department_name: 'Web Developer', default_shift_id: 'shift-1', shift_name: 'Shift Pagi', role: 'employee', phone: '081234567904', email: 'olivia@alhamra.com', joined_at: '2025-09-01', is_active: true },
];

export const leaveRequests: LeaveRequest[] = [
  { id: 'leave-1', employee_id: 'emp-1', employee_name: 'Ahmad Fauzi', leave_type: 'cuti_tahunan', start_date: '2026-06-15', end_date: '2026-06-17', reason: 'Liburan keluarga', status: 'pending', created_at: '2026-06-10' },
  { id: 'leave-2', employee_id: 'emp-3', employee_name: 'Citra Lestari', leave_type: 'sakit', start_date: '2026-06-12', end_date: '2026-06-12', reason: 'Demam dan flu', attachment_url: 'https://example.com/surat-sakit.pdf', status: 'approved', created_at: '2026-06-11' },
  { id: 'leave-3', employee_id: 'emp-4', employee_name: 'Dedi Pratama', leave_type: 'izin', start_date: '2026-06-20', end_date: '2026-06-20', reason: 'Urusan keluarga', status: 'pending', created_at: '2026-06-09' },
  { id: 'leave-4', employee_id: 'emp-6', employee_name: 'Fajar Hidayat', leave_type: 'cuti_tahunan', start_date: '2026-06-25', end_date: '2026-06-28', reason: 'Menikah', status: 'rejected', created_at: '2026-06-08' },
  { id: 'leave-5', employee_id: 'emp-9', employee_name: 'Indah Permata', leave_type: 'sakit', start_date: '2026-06-13', end_date: '2026-06-14', reason: 'Sakit perut', attachment_url: 'https://example.com/surat-sakit2.pdf', status: 'pending', created_at: '2026-06-12' },
];

export const attendanceLogs: AttendanceLog[] = [
  { id: 'att-1', employee_id: 'emp-1', employee_name: 'Ahmad Fauzi', department_name: 'Web Developer', date: '2026-06-11', shift_name: 'Shift Pagi', shift_start: '08:00', shift_end: '17:00', check_in: '2026-06-11T08:05:00', check_out: '2026-06-11T17:10:00', status_in: 'tepat_waktu', anomaly_flag: null },
  { id: 'att-2', employee_id: 'emp-2', employee_name: 'Budi Santoso', department_name: 'Web Developer', date: '2026-06-11', shift_name: 'Shift Pagi', shift_start: '08:00', shift_end: '17:00', check_in: '2026-06-11T08:25:00', check_out: null, status_in: 'terlambat', anomaly_flag: 'lupa_checkout' },
  { id: 'att-3', employee_id: 'emp-3', employee_name: 'Citra Lestari', department_name: 'Dapur', date: '2026-06-11', shift_name: 'Shift Siang', shift_start: '12:00', shift_end: '21:00', check_in: '2026-06-11T12:00:00', check_out: '2026-06-11T21:00:00', status_in: 'tepat_waktu', anomaly_flag: null },
  { id: 'att-4', employee_id: 'emp-4', employee_name: 'Dedi Pratama', department_name: 'Security', date: '2026-06-11', shift_name: 'Shift Malam', shift_start: '20:00', shift_end: '05:00', check_in: '2026-06-11T20:00:00', check_out: '2026-06-12T05:00:00', status_in: 'tepat_waktu', anomaly_flag: null },
  { id: 'att-5', employee_id: 'emp-5', employee_name: 'Eka Wulandari', department_name: 'HR', date: '2026-06-11', shift_name: 'Shift Pagi', shift_start: '08:00', shift_end: '17:00', check_in: '2026-06-11T08:00:00', check_out: '2026-06-11T17:00:00', status_in: 'tepat_waktu', anomaly_flag: null },
];

export const recentScans: ScanRecord[] = [
  { id: 'scan-1', employee_name: 'Ahmad Fauzi', scanned_at: '2026-06-11T08:05:00', status: 'tepat_waktu', type: 'check_in' },
  { id: 'scan-2', employee_name: 'Budi Santoso', scanned_at: '2026-06-11T08:25:00', status: 'terlambat', type: 'check_in' },
  { id: 'scan-3', employee_name: 'Citra Lestari', scanned_at: '2026-06-11T12:00:00', status: 'tepat_waktu', type: 'check_in' },
  { id: 'scan-4', employee_name: 'Dedi Pratama', scanned_at: '2026-06-11T20:00:00', status: 'tepat_waktu', type: 'check_in' },
  { id: 'scan-5', employee_name: 'Eka Wulandari', scanned_at: '2026-06-11T08:00:00', status: 'tepat_waktu', type: 'check_in' },
];

export const rosterEntries: RosterEntry[] = [
  { id: 'rost-1', employee_id: 'emp-3', employee_name: 'Citra Lestari', department_name: 'Dapur', date: '2026-06-01', shift_id: 'shift-2', shift_name: 'Shift Siang' },
  { id: 'rost-2', employee_id: 'emp-4', employee_name: 'Dedi Pratama', department_name: 'Security', date: '2026-06-01', shift_id: 'shift-3', shift_name: 'Shift Malam' },
  { id: 'rost-3', employee_id: 'emp-7', employee_name: 'Gita Ananda', department_name: 'Dapur', date: '2026-06-01', shift_id: 'shift-2', shift_name: 'Shift Siang' },
  { id: 'rost-4', employee_id: 'emp-8', employee_name: 'Hadi Wijaya', department_name: 'Security', date: '2026-06-01', shift_id: 'shift-1', shift_name: 'Shift Pagi' },
  { id: 'rost-5', employee_id: 'emp-3', employee_name: 'Citra Lestari', department_name: 'Dapur', date: '2026-06-02', shift_id: 'shift-3', shift_name: 'Shift Malam' },
];

// Full June 2026 roster (8 employees x 30 days)
const shiftCycle = ['shift-1', 'shift-1', 'shift-1', 'shift-1', 'shift-1', 'off', 'off', 'shift-2', 'shift-2', 'shift-2', 'shift-2', 'shift-2', 'off', 'off', 'shift-3', 'shift-3', 'shift-3', 'shift-3', 'shift-3', 'off', 'off', 'shift-1', 'shift-1', 'shift-1', 'shift-1', 'shift-1', 'off', 'off', 'shift-2', 'shift-2'];

export function generateRoster(empId: string, empName: string, deptName: string, startOffset: number): RosterEntry[] {
  const result: RosterEntry[] = [];
  for (let day = 1; day <= 30; day++) {
    const cycleIdx = (day - 1 + startOffset) % 30;
    const shiftCode = shiftCycle[cycleIdx];
    if (shiftCode === 'off') continue;
    const date = `2026-06-${String(day).padStart(2, '0')}`;
    const shiftEntry = shifts.find(s => s.id === shiftCode)!;
    result.push({
      id: `rost-${empId}-${day}`,
      employee_id: empId,
      employee_name: empName,
      department_name: deptName,
      date,
      shift_id: shiftCode,
      shift_name: shiftEntry?.name ?? 'Shift Pagi',
    });
  }
  return result;
}

export const rosterJune: RosterEntry[] = [
  ...generateRoster('emp-1', 'Ahmad Fauzi', 'Web Developer', 0),
  ...generateRoster('emp-2', 'Budi Santoso', 'Web Developer', 7),
  ...generateRoster('emp-3', 'Citra Lestari', 'Dapur', 14),
  ...generateRoster('emp-4', 'Dedi Pratama', 'Security', 21),
  ...generateRoster('emp-6', 'Fajar Hidayat', 'Web Developer', 3),
  ...generateRoster('emp-7', 'Gita Ananda', 'Dapur', 10),
  ...generateRoster('emp-8', 'Hadi Wijaya', 'Security', 17),
  ...generateRoster('emp-9', 'Indah Permata', 'Web Developer', 24),
];

export const monthlyReports: MonthlyReport[] = [
  { employee_id: 'emp-1', employee_name: 'Ahmad Fauzi', department_name: 'Web Developer', days: { '1': 'H', '2': 'H', '3': 'H', '4': 'H', '5': 'H', '6': 'H', '7': 'H', '8': 'H', '9': 'H', '10': 'H', '11': 'H' }, total_hadir: 11, total_sakit: 0, total_izin: 0, total_cuti: 0, total_alpa: 0, total_terlambat: 0, total_jam_kerja: 88 },
  { employee_id: 'emp-2', employee_name: 'Budi Santoso', department_name: 'Web Developer', days: { '1': 'H', '2': 'T', '3': 'H', '4': 'H', '5': 'H', '6': 'H', '7': 'H', '8': 'T', '9': 'H', '10': 'H', '11': 'H' }, total_hadir: 11, total_sakit: 0, total_izin: 0, total_cuti: 0, total_alpa: 0, total_terlambat: 2, total_jam_kerja: 88 },
  { employee_id: 'emp-3', employee_name: 'Citra Lestari', department_name: 'Dapur', days: { '1': 'H', '2': 'H', '3': 'S', '4': 'H', '5': 'H', '6': 'H', '7': 'H', '8': 'H', '9': 'H', '10': 'H', '11': 'H' }, total_hadir: 10, total_sakit: 1, total_izin: 0, total_cuti: 0, total_alpa: 0, total_terlambat: 0, total_jam_kerja: 90 },
  { employee_id: 'emp-4', employee_name: 'Dedi Pratama', department_name: 'Security', days: { '1': 'H', '2': 'H', '3': 'H', '4': 'H', '5': 'H', '6': 'H', '7': 'I', '8': 'H', '9': 'H', '10': 'H', '11': 'H' }, total_hadir: 10, total_sakit: 0, total_izin: 1, total_cuti: 0, total_alpa: 0, total_terlambat: 0, total_jam_kerja: 90 },
  { employee_id: 'emp-5', employee_name: 'Eka Wulandari', department_name: 'HR', days: { '1': 'H', '2': 'H', '3': 'H', '4': 'H', '5': 'C', '6': 'C', '7': 'H', '8': 'H', '9': 'H', '10': 'H', '11': 'H' }, total_hadir: 9, total_sakit: 0, total_izin: 0, total_cuti: 2, total_alpa: 0, total_terlambat: 0, total_jam_kerja: 72 },
  { employee_id: 'emp-6', employee_name: 'Fajar Hidayat', department_name: 'Web Developer', days: { '1': 'H', '2': 'H', '3': 'H', '4': 'H', '5': 'H', '6': 'H', '7': 'A', '8': 'H', '9': 'H', '10': 'H', '11': 'H' }, total_hadir: 10, total_sakit: 0, total_izin: 0, total_cuti: 0, total_alpa: 1, total_terlambat: 0, total_jam_kerja: 80 },
  { employee_id: 'emp-7', employee_name: 'Gita Ananda', department_name: 'Dapur', days: { '1': 'H', '2': 'H', '3': 'H', '4': 'S', '5': 'H', '6': 'H', '7': 'H', '8': 'H', '9': 'H', '10': 'H', '11': 'H' }, total_hadir: 10, total_sakit: 1, total_izin: 0, total_cuti: 0, total_alpa: 0, total_terlambat: 0, total_jam_kerja: 90 },
  { employee_id: 'emp-8', employee_name: 'Hadi Wijaya', department_name: 'Security', days: { '1': 'H', '2': 'H', '3': 'H', '4': 'H', '5': 'T', '6': 'H', '7': 'H', '8': 'H', '9': 'H', '10': 'H', '11': 'H' }, total_hadir: 11, total_sakit: 0, total_izin: 0, total_cuti: 0, total_alpa: 0, total_terlambat: 1, total_jam_kerja: 88 },
];

export const monthlyReportsJune = monthlyReports;

export const monthlyReportsMay: MonthlyReport[] = [
  { employee_id: 'emp-1', employee_name: 'Ahmad Fauzi', department_name: 'Web Developer', days: { '1': 'H', '2': 'H', '3': 'H', '4': 'H', '5': 'H', '6': 'H', '7': 'H', '8': 'H', '9': 'H', '10': 'H' }, total_hadir: 10, total_sakit: 0, total_izin: 0, total_cuti: 0, total_alpa: 0, total_terlambat: 0, total_jam_kerja: 80 },
  { employee_id: 'emp-2', employee_name: 'Budi Santoso', department_name: 'Web Developer', days: { '1': 'H', '2': 'H', '3': 'T', '4': 'H', '5': 'H', '6': 'H', '7': 'H', '8': 'H', '9': 'H', '10': 'H' }, total_hadir: 10, total_sakit: 0, total_izin: 0, total_cuti: 0, total_alpa: 0, total_terlambat: 1, total_jam_kerja: 80 },
  { employee_id: 'emp-3', employee_name: 'Citra Lestari', department_name: 'Dapur', days: { '1': 'H', '2': 'H', '3': 'H', '4': 'H', '5': 'H', '6': 'H', '7': 'I', '8': 'H', '9': 'H', '10': 'H' }, total_hadir: 9, total_sakit: 0, total_izin: 1, total_cuti: 0, total_alpa: 0, total_terlambat: 0, total_jam_kerja: 81 },
  { employee_id: 'emp-4', employee_name: 'Dedi Pratama', department_name: 'Security', days: { '1': 'H', '2': 'H', '3': 'H', '4': 'H', '5': 'H', '6': 'H', '7': 'H', '8': 'C', '9': 'C', '10': 'H' }, total_hadir: 8, total_sakit: 0, total_izin: 0, total_cuti: 2, total_alpa: 0, total_terlambat: 0, total_jam_kerja: 72 },
  { employee_id: 'emp-5', employee_name: 'Eka Wulandari', department_name: 'HR', days: { '1': 'H', '2': 'H', '3': 'H', '4': 'H', '5': 'H', '6': 'H', '7': 'H', '8': 'H', '9': 'H', '10': 'H' }, total_hadir: 10, total_sakit: 0, total_izin: 0, total_cuti: 0, total_alpa: 0, total_terlambat: 0, total_jam_kerja: 80 },
];

export const monthlyReportsJuly: MonthlyReport[] = [
  { employee_id: 'emp-1', employee_name: 'Ahmad Fauzi', department_name: 'Web Developer', days: {}, total_hadir: 0, total_sakit: 0, total_izin: 0, total_cuti: 0, total_alpa: 0, total_terlambat: 0, total_jam_kerja: 0 },
  { employee_id: 'emp-2', employee_name: 'Budi Santoso', department_name: 'Web Developer', days: {}, total_hadir: 0, total_sakit: 0, total_izin: 0, total_cuti: 0, total_alpa: 0, total_terlambat: 0, total_jam_kerja: 0 },
];

export const adminActivities: AdminActivity[] = [
  { id: 'act-1', type: 'scan', description: 'Ahmad Fauzi scan masuk tepat waktu', user_name: 'Kiosk 1', timestamp: '2026-06-11T08:05:00', link: '/admin/employees' },
  { id: 'act-2', type: 'leave_request', description: 'Citra Lestari mengajukan cuti sakit', user_name: 'Citra Lestari', timestamp: '2026-06-11T07:30:00', link: '/admin/approvals' },
  { id: 'act-3', type: 'approval', description: 'Cuti sakit Citra Lestari disetujui', user_name: 'Eka Wulandari', timestamp: '2026-06-11T09:00:00', link: '/admin/approvals' },
  { id: 'act-4', type: 'employee_update', description: 'Indah Permata diupdate ke Shift Pagi', user_name: 'Eka Wulandari', timestamp: '2026-06-10T14:30:00', link: '/admin/employees' },
  { id: 'act-5', type: 'scan', description: 'Budi Santoso scan masuk terlambat', user_name: 'Kiosk 1', timestamp: '2026-06-11T08:25:00', link: '/admin/reports' },
  { id: 'act-6', type: 'leave_request', description: 'Dedi Pratama mengajukan izin', user_name: 'Dedi Pratama', timestamp: '2026-06-09T10:00:00', link: '/admin/approvals' },
  { id: 'act-7', type: 'approval', description: 'Cuti Fajar Hidayat ditolak', user_name: 'Eka Wulandari', timestamp: '2026-06-08T13:00:00', link: '/admin/approvals' },
  { id: 'act-8', type: 'employee_update', description: 'Joko Suryanto ditambahkan ke Dapur', user_name: 'Eka Wulandari', timestamp: '2026-06-05T09:00:00', link: '/admin/employees' },
];

export const notifications: Notification[] = [
  { id: 'not-1', title: 'Pengajuan Cuti Baru', description: 'Citra Lestari mengajukan cuti sakit', type: 'info', read: false, created_at: '2026-06-11T07:30:00', link: '/admin/approvals' },
  { id: 'not-2', title: 'Karyawan Terlambat', description: 'Budi Santoso scan masuk terlambat', type: 'warning', read: false, created_at: '2026-06-11T08:25:00', link: '/admin/reports' },
  { id: 'not-3', title: 'Cuti Disetujui', description: 'Cuti sakit Citra Lestari disetujui', type: 'success', read: true, created_at: '2026-06-11T09:00:00', link: '/admin/approvals' },
  { id: 'not-4', title: 'Approval Menunggu', description: '3 pengajuan cuti menunggu approval', type: 'warning', read: true, created_at: '2026-06-11T06:00:00', link: '/admin/approvals' },
  { id: 'not-5', title: 'Checkout Belum Lengkap', description: 'Budi Santoso belum checkout hari ini', type: 'error', read: false, created_at: '2026-06-11T17:30:00', link: '/admin/reports' },
];

export const departmentStats: DepartmentStat[] = [
  { department_id: 'dept-1', department_name: 'Web Developer', total_karyawan: 6, hadir: 5, sakit: 0, izin: 0, cuti: 0, alpa: 0 },
  { department_id: 'dept-2', department_name: 'Dapur', total_karyawan: 4, hadir: 3, sakit: 1, izin: 0, cuti: 0, alpa: 0 },
  { department_id: 'dept-3', department_name: 'Security', total_karyawan: 3, hadir: 2, sakit: 0, izin: 0, cuti: 0, alpa: 1 },
  { department_id: 'dept-4', department_name: 'HR', total_karyawan: 2, hadir: 2, sakit: 0, izin: 0, cuti: 0, alpa: 0 },
];
