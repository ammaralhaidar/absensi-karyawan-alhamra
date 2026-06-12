import * as XLSX from 'xlsx'
import type { AttendanceLog, Employee, LeaveRequest } from '@/types'

interface ExportData {
  logs: AttendanceLog[]
  employees: Employee[]
  leaves: LeaveRequest[]
  month: number
  year: number
}

export function generateExcel(data: ExportData): Buffer {
  const { logs, employees, leaves, month, year } = data
  const daysInMonth = new Date(year, month, 0).getDate()

  const rekapHeaders = ['No', 'Nama', 'Departemen', ...Array.from({ length: daysInMonth }, (_, i) => String(i + 1)), 'H', 'T', 'S', 'I', 'C', 'A', 'Total Jam']
  const rekapRows = employees.map((emp, idx) => {
    const row: (string | number)[] = [idx + 1, emp.name, emp.department_name || '']
    const empLogs = logs.filter(l => l.employee_id === emp.id)
    const empLeaves = leaves.filter(l => l.employee_id === emp.id && l.status === 'approved')

    let hadir = 0, terlambat = 0, sakit = 0, izin = 0, cuti = 0, alpa = 0, totalJam = 0

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const log = empLogs.find(l => l.date === dateStr)
      const leave = empLeaves.find(l => {
        const start = new Date(l.start_date)
        const end = new Date(l.end_date)
        const current = new Date(dateStr)
        return current >= start && current <= end
      })

      let code = 'A'
      if (leave) {
        code = leave.leave_type === 'sakit' ? 'S' : leave.leave_type === 'izin' ? 'I' : 'C'
        if (code === 'S') sakit++
        else if (code === 'I') izin++
        else if (code === 'C') cuti++
      } else if (log) {
        if (log.status_in === 'tepat_waktu') { code = 'H'; hadir++ }
        else if (log.status_in === 'terlambat') { code = 'T'; terlambat++ }

        if (log.check_in && log.check_out) {
          const checkIn = new Date(`2000-01-01T${log.check_in}`)
          const checkOut = new Date(`2000-01-01T${log.check_out}`)
          totalJam += Math.max(0, (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60))
        }
      } else {
        alpa++
      }

      row.push(code)
    }

    row.push(hadir, terlambat, sakit, izin, cuti, alpa, Math.round(totalJam * 100) / 100)
    return row
  })

  const rekapSheet = XLSX.utils.aoa_to_sheet([rekapHeaders, ...rekapRows])

  const logHeaders = ['Tanggal', 'Nama', 'Departemen', 'Shift', 'Jam Masuk', 'Jam Pulang', 'Status Masuk', 'Status Pulang', 'Anomali']
  const logRows = logs.map(log => {
    const emp = employees.find(e => e.id === log.employee_id)
    return [
      log.date,
      emp?.name || '',
      emp?.department_name || '',
      log.shift_name || '-',
      log.check_in || '-',
      log.check_out || '-',
      log.status_in || '-',
      log.check_out ? 'Tepat Waktu' : '-',
      log.anomaly_flag || '-',
    ]
  })

  const logSheet = XLSX.utils.aoa_to_sheet([logHeaders, ...logRows])

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, rekapSheet, 'Rekapitulasi')
  XLSX.utils.book_append_sheet(workbook, logSheet, 'Log Kronologis')

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
}
