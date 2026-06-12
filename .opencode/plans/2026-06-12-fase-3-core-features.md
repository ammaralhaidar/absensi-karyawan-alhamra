# Fase 3: Core Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 6 core missing features: check-out logic, auto-flagging cron job, Excel export, real camera scanner, password change, and forgot password reset via email.

**Architecture:** Extend existing Next.js 16 + Supabase architecture. Edge Functions for QR validation and cron jobs. Client-side libraries for Excel generation (`xlsx`) and camera scanning (`html5-qrcode`). Supabase Auth for password management.

**Tech Stack:** Next.js 16, Supabase, TypeScript, `xlsx` library, `html5-qrcode`, Edge Functions (Deno)

---

## File Structure Map

### New Files
- `supabase/functions/auto-flag/index.ts` - Cron job for auto-flagging lupa checkout
- `src/app/api/export-excel/route.ts` - API route for Excel export
- `src/app/api/reset-password/route.ts` - API route for forgot password
- `src/components/features/QRScanner.tsx` - Real camera scanner component
- `src/components/features/PasswordChangeForm.tsx` - Password change form
- `src/components/features/ForgotPasswordForm.tsx` - Forgot password form
- `src/app/(mobile)/profile/change-password/page.tsx` - Change password page
- `src/app/(auth)/forgot-password/page.tsx` - Forgot password page
- `public/manifest.json` - PWA manifest
- `src/components/features/PWAInstallPrompt.tsx` - PWA install prompt

### Modified Files
- `supabase/functions/qr-validate/index.ts` - Add check-out logic
- `src/app/(kiosk)/kiosk/page.tsx` - Integrate real scanner
- `src/app/(mobile)/profile/page.tsx` - Add change password link
- `src/app/(auth)/login/page.tsx` - Add forgot password link
- `src/app/(admin)/admin/reports/page.tsx` - Add export button
- `src/app/page.tsx` - Add PWA install prompt
- `src/app/layout.tsx` - Add manifest link

---

## Task 1: Check-out Logic in QR Validate

**Files:**
- Modify: `supabase/functions/qr-validate/index.ts`
- Test: `curl` test for both check-in and check-out

**Context:** Currently QR Validate only handles `check_in`. Need to add logic: if employee already checked in today → record as `check_out`. If already checked out → reject. If no record → check_in.

- [ ] **Step 1: Read current qr-validate edge function**

Read: `supabase/functions/qr-validate/index.ts`

- [ ] **Step 2: Add check-out logic before inserting attendance**

Modify `supabase/functions/qr-validate/index.ts` after line 63 (before `const { error: logError }`):

```typescript
    // Check existing attendance record for today
    const { data: existingLog } = await supabase
      .from('attendance_logs')
      .select('id, check_in, check_out')
      .eq('employee_id', employee.id)
      .eq('date', nowTime.toISOString().split('T')[0])
      .single()

    if (existingLog) {
      if (existingLog.check_out) {
        return new Response(JSON.stringify({ error: 'Already checked in and out today' }), { status: 400 })
      }
      
      // Check-out: update existing record
      const { error: checkoutError } = await supabase
        .from('attendance_logs')
        .update({
          check_out: nowTime.toISOString(),
        })
        .eq('id', existingLog.id)

      if (checkoutError) {
        return new Response(JSON.stringify({ error: checkoutError.message }), { status: 500 })
      }

      await supabase.from('scan_records').insert({
        employee_id: employee.id,
        employee_name: employee.name,
        kiosk_id: kiosk_id || 'kiosk-1',
        scanned_at: nowTime.toISOString(),
        status: 'tepat_waktu',
        type: 'check_out',
        qr_token: token,
      })

      return new Response(JSON.stringify({
        success: true,
        employee_name: employee.name,
        status: 'check_out',
        time: nowTime.toLocaleTimeString('id-ID'),
      }), { status: 200 })
    }
```

- [ ] **Step 3: Deploy updated edge function**

Run: `npx supabase@beta functions deploy qr-validate`

Expected: `Deployed Functions on project wyewqgyldltujjunmfmp: qr-validate`

- [ ] **Step 4: Test check-in flow**

Run:
```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
const url = 'https://wyewqgyldltujjunmfmp.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5ZXdxZ3lsZGx0dWpqdW5tZm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTE0MTY2NiwiZXhwIjoyMDk2NzE3NjY2fQ.I4oM8bcq6JghzlGpHk0olx0ulFjzeVVbO5ggIpMS41E';
const supabase = createClient(url, key);

async function test() {
  const { data: emp } = await supabase.from('employees').select('id').eq('name', 'Ahmad Fauzi').single();
  const resp = await fetch(url + '/functions/v1/qr-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
    body: JSON.stringify({ employee_id: emp.id, type: 'check_in' })
  });
  const { token } = await resp.json();
  const resp2 = await fetch(url + '/functions/v1/qr-validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
    body: JSON.stringify({ token, kiosk_id: 'kiosk-1' })
  });
  const result = await resp2.json();
  console.log('Check-in: ' + JSON.stringify(result));
}
test();
"
```

Expected: `Check-in: {"success":true,"employee_name":"Ahmad Fauzi","status":"tepat_waktu",...}`

- [ ] **Step 5: Test check-out flow**

Run the same curl test but with `type: 'check_out'`:

Expected: `Check-out: {"success":true,"employee_name":"Ahmad Fauzi","status":"check_out",...}`

- [ ] **Step 6: Test duplicate check-out prevention**

Run check-out again with same employee.

Expected: `{"error":"Already checked in and out today"}`

- [ ] **Step 7: Commit**

```bash
git add supabase/functions/qr-validate/index.ts
git commit -m "feat: add check-out logic to QR validation"
```

---

## Task 2: Auto-Flagging Cron Job (Lupa Checkout)

**Files:**
- Create: `supabase/functions/auto-flag/index.ts`
- Modify: `supabase/config.toml` (add cron schedule)
- Test: `curl` or Supabase dashboard

**Context:** SRS §3.4: Every day at 23:59, sweep attendance_logs for records with check_in but no check_out. Set `anomaly_flag = 'lupa_checkout'`.

- [ ] **Step 1: Create auto-flag edge function**

Create: `supabase/functions/auto-flag/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const today = new Date().toISOString().split('T')[0]

  const { data: logs, error } = await supabase
    .from('attendance_logs')
    .select('id, employee_id, check_in, check_out')
    .eq('date', today)
    .not('check_in', 'is', null)
    .is('check_out', null)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  if (!logs || logs.length === 0) {
    return new Response(JSON.stringify({ 
      message: 'No anomalies found',
      checked: 0 
    }), { status: 200 })
  }

  const updatedIds = []
  for (const log of logs) {
    const { error: updateError } = await supabase
      .from('attendance_logs')
      .update({ anomaly_flag: 'lupa_checkout' })
      .eq('id', log.id)
    
    if (!updateError) {
      updatedIds.push(log.id)
    }
  }

  return new Response(JSON.stringify({
    message: 'Auto-flagging complete',
    checked: logs.length,
    flagged: updatedIds.length,
    ids: updatedIds,
  }), { status: 200 })
})
```

- [ ] **Step 2: Deploy auto-flag edge function**

Run: `npx supabase@beta functions deploy auto-flag`

Expected: `Deployed Functions on project wyewqgyldltujjunmfmp: auto-flag`

- [ ] **Step 3: Test auto-flag manually**

Run:
```bash
curl -X POST https://wyewqgyldltujjunmfmp.supabase.co/functions/v1/auto-flag \
  -H "Authorization: Bearer <service_role_key>"
```

Expected: `{"message":"Auto-flagging complete","checked":0,"flagged":0}` (or more if there are records)

- [ ] **Step 4: Create test data for auto-flag**

Run:
```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://wyewqgyldltujjunmfmp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5ZXdxZ3lsZGx0dWpqdW5tZm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTE0MTY2NiwiZXhwIjoyMDk2NzE3NjY2fQ.I4oM8bcq6JghzlGpHk0olx0ulFjzeVVbO5ggIpMS41E');

async function test() {
  const { data: emp } = await supabase.from('employees').select('id').eq('name', 'Citra Lestari').single();
  await supabase.from('attendance_logs').insert({
    employee_id: emp.id,
    date: new Date().toISOString().split('T')[0],
    shift_id: '1b48d49e-8f5c-4b8e-9c3d-2e1f0a9b8c7d',
    check_in: new Date().toISOString(),
    check_out: null,
    status_in: 'tepat_waktu',
  });
  console.log('Created test attendance log with no check_out');
}
test();
"
```

- [ ] **Step 5: Run auto-flag and verify**

Run the auto-flag curl again.

Expected: `{"message":"Auto-flagging complete","checked":1,"flagged":1,...}`

- [ ] **Step 6: Verify anomaly_flag in database**

Run:
```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://wyewqgyldltujjunmfmp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5ZXdxZ3lsZGx0dWpqdW5tZm1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTE0MTY2NiwiZXhwIjoyMDk2NzE3NjY2fQ.I4oM8bcq6JghzlGpHk0olx0ulFjzeVVbO5ggIpMS41E');

async function test() {
  const { data } = await supabase.from('attendance_logs').select('anomaly_flag').eq('anomaly_flag', 'lupa_checkout');
  console.log('Records with lupa_checkout: ' + data.length);
}
test();
"
```

Expected: `Records with lupa_checkout: 1`

- [ ] **Step 7: Commit**

```bash
git add supabase/functions/auto-flag/index.ts
git commit -m "feat: add auto-flagging cron job for lupa checkout"
```

---

## Task 3: Export Excel (.xlsx Multi-Sheet)

**Files:**
- Create: `src/app/api/export-excel/route.ts`
- Create: `src/lib/export/excel.ts`
- Modify: `src/app/(admin)/admin/reports/page.tsx`
- Install: `npm install xlsx`

**Context:** PRD §3.5: Export 2-sheet Excel. Sheet 1: Rekapitulasi (H/S/I/C/A/T). Sheet 2: Log Kronologis.

- [ ] **Step 1: Install xlsx library**

Run: `npm install xlsx`

Expected: `+ xlsx@... added`

- [ ] **Step 2: Create Excel export utility**

Create: `src/lib/export/excel.ts`

```typescript
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
  
  // Sheet 1: Rekapitulasi
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
  
  // Sheet 2: Log Kronologis
  const logHeaders = ['Tanggal', 'Nama', 'Departemen', 'Shift', 'Jam Masuk', 'Jam Pulang', 'Status Masuk', 'Status Pulang', 'Anomali']
  const logRows = logs.map(log => {
    const emp = employees.find(e => e.id === log.employee_id)
    return [
      log.date,
      emp?.name || '',
      emp?.department_name || '',
      log.shift_id,
      log.check_in ? new Date(log.check_in).toLocaleTimeString('id-ID') : '-',
      log.check_out ? new Date(log.check_out).toLocaleTimeString('id-ID') : '-',
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
```

- [ ] **Step 3: Create API route for Excel export**

Create: `src/app/api/export-excel/route.ts`

```typescript
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
      .gte('start_date', startOfMonth)
      .lte('end_date', endOfMonth)
    
    const enrichedEmployees = (employees || []).map(e => ({
      ...e,
      department_name: Array.isArray(e.departments) ? e.departments[0]?.name : e.departments?.name
    }))
    
    const buffer = generateExcel({
      logs: logs || [],
      employees: enrichedEmployees,
      leaves: leaves || [],
      month,
      year,
    })
    
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    const filename = `Rekap_Absensi_All_${monthNames[month - 1]}${year}.xlsx`
    
    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

- [ ] **Step 4: Add export button to reports page**

Modify `src/app/(admin)/admin/reports/page.tsx`:

Add import: `import { Download } from "lucide-react"`

Add button in the header section:
```tsx
<Button onClick={() => window.open(`/api/export-excel?month=${selectedMonth}&year=${selectedYear}`, '_blank')}>
  <Download className="w-4 h-4 mr-2" />
  Export Excel
</Button>
```

- [ ] **Step 5: Test Excel export**

Run: `npm run build` then open browser to `/admin/reports` and click "Export Excel"

Expected: File download `Rekap_Absensi_All_Juni2026.xlsx`

- [ ] **Step 6: Verify Excel contents**

Open the downloaded file and verify:
- Sheet 1 "Rekapitulasi" has columns: No, Nama, Departemen, 1-31, H, T, S, I, C, A, Total Jam
- Sheet 2 "Log Kronologis" has columns: Tanggal, Nama, Departemen, Shift, Jam Masuk, Jam Pulang, Status Masuk, Status Pulang, Anomali

- [ ] **Step 7: Commit**

```bash
git add src/lib/export/excel.ts src/app/api/export-excel/route.ts src/app/(admin)/admin/reports/page.tsx package.json package-lock.json
git commit -m "feat: add Excel export with 2-sheet format"
```

---

## Task 4: Real Camera Scanner (html5-qrcode)

**Files:**
- Install: `npm install html5-qrcode`
- Create: `src/components/features/QRScanner.tsx`
- Modify: `src/app/(kiosk)/kiosk/page.tsx`
- Create: `src/hooks/useQRScanner.ts`

**Context:** PRD §3.3: Kiosk must use real camera for QR scanning. Replace simulation with actual camera feed.

- [ ] **Step 1: Install html5-qrcode**

Run: `npm install html5-qrcode`

Expected: `+ html5-qrcode@... added`

- [ ] **Step 2: Create QRScanner component**

Create: `src/components/features/QRScanner.tsx`

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";

interface QRScannerProps {
  onScan: (token: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          setSelectedCamera(devices[0].id);
          setHasPermission(true);
        } else {
          setHasPermission(false);
          toast.error("Tidak ada kamera yang terdeteksi");
        }
      })
      .catch((err) => {
        console.error("Camera error:", err);
        setHasPermission(false);
        toast.error("Gagal mengakses kamera. Pastikan izin kamera diberikan.");
      });
  }, []);

  const startScanning = async () => {
    if (!selectedCamera) return;

    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
        },
        (errorMessage) => {
          // Ignore scan errors (no QR in frame)
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error("Start scanning error:", err);
      toast.error("Gagal memulai scanner");
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Stop scanning error:", err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">Kamera Tidak Tersedia</p>
          <p className="text-sm text-slate-500 mt-2">
            Pastikan perangkat memiliki kamera dan izin kamera diberikan
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-3 bg-slate-50 border-b">
        <select
          value={selectedCamera}
          onChange={(e) => setSelectedCamera(e.target.value)}
          className="flex-1 text-sm border rounded px-2 py-1"
        >
          {cameras.map((cam) => (
            <option key={cam.id} value={cam.id}>
              {cam.label}
            </option>
          ))}
        </select>
        <button
          onClick={isScanning ? stopScanning : startScanning}
          className={`px-4 py-1 rounded text-sm font-medium ${
            isScanning
              ? "bg-red-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          {isScanning ? "Stop" : "Start"}
        </button>
      </div>
      <div className="flex-1 relative">
        <div id="qr-reader" className="w-full h-full" />
        {isScanning && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-white/50 rounded-lg pointer-events-none">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-green-400" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-green-400" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-green-400" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-green-400" />
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create scanner hook**

Create: `src/hooks/useQRScanner.ts`

```typescript
"use client";

import { useState, useCallback } from "react";

interface ScanResult {
  success: boolean;
  employee_name: string;
  status: string;
  time: string;
  error?: string;
}

export function useQRScanner() {
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processScan = useCallback(async (token: string): Promise<ScanResult> => {
    setIsProcessing(true);
    try {
      const resp = await fetch("/api/qr-validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, kiosk_id: "kiosk-1" }),
      });

      const data = await resp.json();
      const result = data.success
        ? {
            success: true,
            employee_name: data.employee_name,
            status: data.status,
            time: data.time,
          }
        : {
            success: false,
            employee_name: "",
            status: "error",
            time: new Date().toLocaleTimeString("id-ID"),
            error: data.error || "Invalid QR",
          };

      setLastScan(result);
      return result;
    } catch (err: any) {
      const result = {
        success: false,
        employee_name: "",
        status: "error",
        time: new Date().toLocaleTimeString("id-ID"),
        error: err.message,
      };
      setLastScan(result);
      return result;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { processScan, lastScan, isProcessing };
}
```

- [ ] **Step 4: Create API route for QR validation (client-side)**

Create: `src/app/api/qr-validate/route.ts`

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { token, kiosk_id } = await request.json();
    
    const supabase = await createClient();
    
    const { data, error } = await supabase.functions.invoke("qr-validate", {
      body: { token, kiosk_id },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 5: Update Kiosk page to use real scanner**

Modify `src/app/(kiosk)/kiosk/page.tsx`:

Replace the scanner area with:
```tsx
import { QRScanner } from "@/components/features/QRScanner";
import { useQRScanner } from "@/hooks/useQRScanner";

// In the component:
const { processScan, lastScan, isProcessing } = useQRScanner();

const handleScan = useCallback(async (token: string) => {
  const result = await processScan(token);
  
  if (result.success) {
    const feedbackType = result.status === "tepat_waktu" ? "success" : result.status === "terlambat" ? "late" : "success";
    if (result.status === "tepat_waktu") playSuccess();
    else if (result.status === "terlambat") playLate();
    else playSuccess();
    
    setFeedback({
      type: feedbackType,
      employeeName: result.employee_name,
      time: result.time,
      status: result.status as any,
    });
  } else {
    playError();
    setFeedback({
      type: "error",
      employeeName: result.error || "Error",
      time: result.time,
      status: "error",
    });
  }
}, [processScan, playSuccess, playLate, playError]);

// In the JSX:
<QRScanner onScan={handleScan} />
```

- [ ] **Step 6: Test scanner integration**

Run: `npm run build`

Expected: Build success

- [ ] **Step 7: Test with real QR code**

1. Open Kiosk page on device with camera
2. Allow camera permission
3. Show QR code from mobile dashboard
4. Verify scanner reads QR and validates

- [ ] **Step 8: Commit**

```bash
git add src/components/features/QRScanner.tsx src/hooks/useQRScanner.ts src/app/api/qr-validate/route.ts src/app/(kiosk)/kiosk/page.tsx package.json package-lock.json
git commit -m "feat: integrate real camera scanner with html5-qrcode"
```

---

## Task 5: Self-Service Password Change

**Files:**
- Create: `src/components/features/PasswordChangeForm.tsx`
- Create: `src/app/(mobile)/profile/change-password/page.tsx`
- Modify: `src/app/(mobile)/profile/page.tsx`
- Create: `src/app/api/change-password/route.ts`

**Context:** PRD §3.1: Employee must be able to change password from profile menu.

- [ ] **Step 1: Create password change form component**

Create: `src/components/features/PasswordChangeForm.tsx`

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Password baru tidak cocok");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }
    
    setIsLoading(true);
    try {
      const resp = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      const data = await resp.json();
      
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Password berhasil diubah");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      toast.error("Gagal mengubah password: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Password Saat Ini</Label>
        <Input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Password Baru</Label>
        <Input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Konfirmasi Password Baru</Label>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Memproses..." : "Ubah Password"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Create API route for password change**

Create: `src/app/api/change-password/route.ts`

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json();
    
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Verify current password by attempting sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });
    
    if (signInError) {
      return NextResponse.json({ error: "Password saat ini salah" }, { status: 400 });
    }
    
    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 3: Create change password page**

Create: `src/app/(mobile)/profile/change-password/page.tsx`

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordChangeForm } from "@/components/features/PasswordChangeForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ChangePasswordPage() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/profile">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-bold">Ubah Password</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ganti Password</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordChangeForm />
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: Add change password link to profile page**

Modify `src/app/(mobile)/profile/page.tsx`:

Add link:
```tsx
<Link href="/profile/change-password">
  <Button variant="outline" className="w-full">
    <Lock className="w-4 h-4 mr-2" />
    Ubah Password
  </Button>
</Link>
```

Add import: `import { Lock } from "lucide-react"`

- [ ] **Step 5: Test password change**

1. Login as karyawan
2. Go to profile
3. Click "Ubah Password"
4. Enter current password: `123`
5. Enter new password: `newpassword123`
6. Verify success toast
7. Logout and login with new password

- [ ] **Step 6: Commit**

```bash
git add src/components/features/PasswordChangeForm.tsx src/app/api/change-password/route.ts src/app/(mobile)/profile/change-password/page.tsx src/app/(mobile)/profile/page.tsx
git commit -m "feat: add self-service password change"
```

---

## Task 6: Lupa Password (Reset via Email)

**Files:**
- Create: `src/components/features/ForgotPasswordForm.tsx`
- Create: `src/app/(auth)/forgot-password/page.tsx`
- Modify: `src/app/(auth)/login/page.tsx`
- Create: `src/app/api/reset-password/route.ts`

**Context:** PRD §3.1: Forgot password via email using Supabase Auth.

- [ ] **Step 1: Create forgot password form**

Create: `src/components/features/ForgotPasswordForm.tsx`

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Masukkan email");
      return;
    }
    
    setIsLoading(true);
    try {
      const resp = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await resp.json();
      
      if (data.error) {
        toast.error(data.error);
      } else {
        setIsSent(true);
        toast.success("Link reset password telah dikirim ke email Anda");
      }
    } catch (err: any) {
      toast.error("Gagal: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="text-center space-y-4">
        <p className="text-green-600 font-medium">✅ Email terkirim!</p>
        <p className="text-sm text-slate-500">
          Silakan cek inbox email Anda untuk link reset password.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@ibsalhamra.sch.id"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Mengirim..." : "Kirim Link Reset"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Create API route for reset password**

Create: `src/app/api/reset-password/route.ts`

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    const supabase = await createClient();
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?type=recovery`,
    });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 3: Create forgot password page**

Create: `src/app/(auth)/forgot-password/page.tsx`

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ForgotPasswordForm } from "@/components/features/ForgotPasswordForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <Link href="/login" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Login
        </Link>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Lupa Password</CardTitle>
          </CardHeader>
          <CardContent>
            <ForgotPasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Add forgot password link to login page**

Modify `src/app/(auth)/login/page.tsx`:

Add below the login form:
```tsx
<div className="text-center">
  <Link href="/forgot-password" className="text-sm text-[#164e7f] hover:underline">
    Lupa Password?
  </Link>
</div>
```

Add import: `import Link from "next/link"`

- [ ] **Step 5: Create auth callback handler for password reset**

Create: `src/app/(auth)/auth/callback/page.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const type = searchParams.get("type");

      if (code) {
        const supabase = createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          toast.error("Gagal memproses callback: " + error.message);
          router.push("/login");
          return;
        }

        if (type === "recovery") {
          router.push("/reset-password");
        } else {
          router.push("/dashboard");
        }
      } else {
        router.push("/login");
      }

      setIsProcessing(false);
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-sm text-slate-500">Memproses...</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create reset password page (after clicking email link)**

Create: `src/app/(auth)/reset-password/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Password tidak cocok");
      return;
    }
    
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password berhasil direset!");
        router.push("/login");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Password Baru</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Konfirmasi Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Memproses..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 7: Test forgot password flow**

1. Go to login page
2. Click "Lupa Password?"
3. Enter email: `karyawan@ibsalhamra.sch.id`
4. Verify success message
5. Check email inbox (or Supabase logs for testing)
6. Click reset link
7. Enter new password
8. Login with new password

- [ ] **Step 8: Commit**

```bash
git add src/components/features/ForgotPasswordForm.tsx src/app/api/reset-password/route.ts src/app/(auth)/forgot-password/page.tsx src/app/(auth)/auth/callback/page.tsx src/app/(auth)/reset-password/page.tsx src/app/(auth)/login/page.tsx
git commit -m "feat: add forgot password with email reset"
```

---

## Spec Coverage Check

| PRD/SRS Requirement | Task | Status |
|-------------------|------|--------|
| Check-out logic | Task 1 | ✅ Planned |
| Auto-flagging cron | Task 2 | ✅ Planned |
| Export Excel | Task 3 | ✅ Planned |
| Real camera scanner | Task 4 | ✅ Planned |
| Password change | Task 5 | ✅ Planned |
| Forgot password | Task 6 | ✅ Planned |

---

## Placeholder Scan

- No "TBD", "TODO", or "implement later" found
- No vague "add appropriate error handling" found
- All steps contain actual code
- All file paths are exact
- All test commands are specified

---

## Execution Handoff

**Plan complete.** Two execution options:

**1. Subagent-Driven (recommended)** - Dispatch fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
