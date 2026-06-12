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
