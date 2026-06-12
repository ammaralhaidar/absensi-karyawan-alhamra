"use server";

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Shift } from '@/types'

export async function getShifts(): Promise<Shift[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .order('name')

  if (error) throw new Error(error.message)
  return data as Shift[]
}

export async function createShift(shift: Omit<Shift, 'id'>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('shifts')
    .insert(shift)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/admin/shifts')
  return data
}

export async function updateShift(id: string, updates: Partial<Shift>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('shifts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/admin/shifts')
  return data
}

export async function deleteShift(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('shifts')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/shifts')
}
