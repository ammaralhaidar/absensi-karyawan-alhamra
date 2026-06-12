import { createClient } from '@/lib/supabase/server'
import type { AdminActivity } from '@/types'

export async function getAdminActivities(): Promise<AdminActivity[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('admin_activities')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return data.map(a => ({
    ...a,
    timestamp: a.created_at,
  })) as AdminActivity[]
}
