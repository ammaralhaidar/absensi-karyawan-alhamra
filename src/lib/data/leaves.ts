"use server";

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { LeaveRequest } from '@/types'

export async function getLeaveRequests(): Promise<LeaveRequest[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*, employees(name)')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map(l => ({
    ...l,
    employee_name: Array.isArray(l.employees) ? l.employees[0]?.name ?? '' : (l.employees as { name: string })?.name ?? '',
  })) as LeaveRequest[]
}

export async function getEmployeeLeaveRequests(employeeId: string): Promise<LeaveRequest[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data as LeaveRequest[]
}

export async function createLeaveRequest(leave: Omit<LeaveRequest, 'id' | 'created_at'>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('leave_requests')
    .insert(leave)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/leaves')
  return data
}

export async function approveLeaveRequest(id: string, approvedBy: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('leave_requests')
    .update({
      status: 'approved',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/admin/approvals')
  return data
}

export async function rejectLeaveRequest(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('leave_requests')
    .update({ status: 'rejected' })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/admin/approvals')
  return data
}
