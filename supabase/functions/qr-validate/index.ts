import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-secret-key'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  const { token, kiosk_id } = await req.json()

  try {
    const [header, payload, signature] = token.split('.')
    const signingInput = `${header}.${payload}`

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const verifySignature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput))
    const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(verifySignature)))

    if (signature !== expectedSignature) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 400 })
    }

    const decodedPayload = JSON.parse(atob(payload))
    const now = Math.floor(Date.now() / 1000)

    if (decodedPayload.exp < now) {
      return new Response(JSON.stringify({ error: 'Token expired' }), { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: employee } = await supabase
      .from('employees')
      .select('id, name, department_id, default_shift_id')
      .eq('id', decodedPayload.sub)
      .single()

    if (!employee) {
      return new Response(JSON.stringify({ error: 'Employee not found' }), { status: 404 })
    }

    const { data: shift } = await supabase
      .from('shifts')
      .select('start_time, end_time, late_tolerance_minutes')
      .eq('id', employee.default_shift_id)
      .single()

    if (!shift) {
      return new Response(JSON.stringify({ error: 'Shift not found' }), { status: 404 })
    }

    const nowTime = new Date()
    const today = nowTime.toISOString().split('T')[0]
    const shiftStart = new Date(`${today}T${shift.start_time}`)
    const lateThreshold = new Date(shiftStart.getTime() + shift.late_tolerance_minutes * 60000)

    const status = nowTime <= lateThreshold ? 'tepat_waktu' : 'terlambat'

    const insertScan = async (scanStatus: string, scanType: string) => {
      const { error: scanErr } = await supabase.from('scan_records').insert({
        employee_id: employee.id,
        employee_name: employee.name,
        kiosk_id: kiosk_id || 'kiosk-1',
        scanned_at: nowTime.toISOString(),
        status: scanStatus,
        type: scanType,
        qr_token: token,
      })
      if (scanErr) console.error('scan_records insert failed:', scanErr.message)
    }

    // Check existing attendance record for today
    const { data: existingLog } = await supabase
      .from('attendance_logs')
      .select('id, check_in, check_out')
      .eq('employee_id', employee.id)
      .eq('date', today)
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

      await insertScan('tepat_waktu', 'check_out')

      return new Response(JSON.stringify({
        success: true,
        employee_name: employee.name,
        status: 'check_out',
        time: nowTime.toLocaleTimeString('id-ID'),
      }), { status: 200 })
    }

    const { error: logError } = await supabase
      .from('attendance_logs')
      .insert({
        employee_id: employee.id,
        date: today,
        shift_id: employee.default_shift_id,
        check_in: nowTime.toISOString(),
        status_in: status,
      })

    if (logError) {
      return new Response(JSON.stringify({ error: logError.message }), { status: 500 })
    }

    await insertScan(status, decodedPayload.type)

    return new Response(JSON.stringify({
      success: true,
      employee_name: employee.name,
      status,
      time: nowTime.toLocaleTimeString('id-ID'),
    }), { status: 200 })

  } catch (err) {
    console.error('qr-validate error:', err)
    return new Response(JSON.stringify({ error: 'Invalid token format' }), { status: 400 })
  }
})
