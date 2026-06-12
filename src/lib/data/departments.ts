"use server";

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Department } from '@/types'

export async function getDepartments(): Promise<Department[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('name')

  if (error) throw new Error(error.message)
  return data as Department[]
}

export async function createDepartment(department: Omit<Department, 'id'>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('departments')
    .insert(department)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/admin/departments')
  return data
}

export async function updateDepartment(id: string, updates: Partial<Department>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('departments')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/admin/departments')
  return data
}

export async function deleteDepartment(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('departments')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/departments')
}
