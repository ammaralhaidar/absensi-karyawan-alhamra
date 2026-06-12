import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateExcel } from "@/lib/export/excel"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1))
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))

    const supabase = await createClient()

    const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`
    const endOfMonth = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`

    const { data: logs } = await supabase
      .from('attendance_logs')
      .select('*')
      .gte('date', startOfMonth)
      .lte('date', endOfMonth)

    const { data: employees } = await supabase
      .from('employees')
      .select('id, name, department_id, departments(name)')
      .eq('is_active', true)

    const { data: leaves } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('status', 'approved')
      .lte('start_date', endOfMonth)
      .gte('end_date', startOfMonth)

    const enrichedEmployees = (employees || []).map((e: Record<string, unknown>) => ({
      ...e,
      department_name: Array.isArray(e.departments) ? (e.departments as { name: string }[])[0]?.name : (e.departments as { name: string })?.name
    }))

    const buffer = generateExcel({
      logs: (logs || []) as any[],
      employees: enrichedEmployees as any[],
      leaves: (leaves || []) as any[],
      month,
      year,
    })

    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    const filename = `Rekap_Absensi_All_${monthNames[month - 1]}${year}.xlsx`

    return new Response(buffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
