"use server";

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Employee } from '@/types'

export async function getEmployees(): Promise<Employee[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('employees')
    .select('id, nik, name, email, phone, department_id, departments(name), default_shift_id, shifts(name), role, avatar_url, joined_at, is_active')
    .eq('is_active', true)
    .order('name')

  if (error) throw new Error(error.message)

  return (data ?? []).map(e => ({
    ...e,
    department_name: Array.isArray(e.departments) ? e.departments[0]?.name ?? '' : (e.departments as { name: string })?.name ?? '',
    shift_name: Array.isArray(e.shifts) ? e.shifts[0]?.name ?? '' : (e.shifts as { name: string })?.name ?? '',
  })) as Employee[]
}

export async function getAllEmployees(): Promise<Employee[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('employees')
    .select('id, nik, name, email, phone, department_id, departments(name), default_shift_id, shifts(name), role, avatar_url, joined_at, is_active')
    .order('name')

  if (error) throw new Error(error.message)

  return (data ?? []).map(e => ({
    ...e,
    department_name: Array.isArray(e.departments) ? e.departments[0]?.name ?? '' : (e.departments as { name: string })?.name ?? '',
    shift_name: Array.isArray(e.shifts) ? e.shifts[0]?.name ?? '' : (e.shifts as { name: string })?.name ?? '',
  })) as Employee[]
}

export async function getEmployee(id: string): Promise<Employee | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('employees')
    .select('*, departments(name), shifts(name)')
    .eq('id', id)
    .single()

  if (error || !data) return null
  const dept = Array.isArray(data.departments) ? data.departments[0] : data.departments
  const shft = Array.isArray(data.shifts) ? data.shifts[0] : data.shifts
  return { ...data, department_name: (dept as { name: string })?.name ?? '', shift_name: (shft as { name: string })?.name ?? '' } as Employee
}

export async function createEmployee(employee: Omit<Employee, 'id'>) {
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: employee.email,
    password: 'alhamra2024',
    email_confirm: true,
  })

  if (authError) throw new Error(authError.message)

  const { data, error } = await supabase
    .from('employees')
    .insert({ ...employee, auth_id: authData.user.id })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/admin/employees')
  return data
}

export async function updateEmployee(id: string, updates: Partial<Employee>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('employees')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/admin/employees')
  return data
}

export async function deleteEmployee(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('employees')
    .update({ is_active: false })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/employees')
}

export async function createEmployeesBulk(employees: Omit<Employee, 'id'>[]) {
  const supabase = await createClient()
  const created: Employee[] = []
  const errors: string[] = []

  for (const emp of employees) {
    try {
      // Create Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: emp.email,
        password: 'alhamra2024',
        email_confirm: true,
      })

      if (authError) {
        errors.push(`${emp.name}: ${authError.message}`)
        continue
      }

      // Create employee with auth_id
      const { data, error } = await supabase
        .from('employees')
        .insert({ ...emp, auth_id: authData.user.id })
        .select()
        .single()

      if (error) {
        errors.push(`${emp.name}: ${error.message}`)
        continue
      }

      created.push(data)
    } catch (e: any) {
      errors.push(`${emp.name}: ${e.message}`)
    }
  }

  revalidatePath('/admin/employees')
  return { created, errors }
}
