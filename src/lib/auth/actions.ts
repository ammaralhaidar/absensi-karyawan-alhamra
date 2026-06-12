"use server";

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signIn(email: string, password: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  const { data: profile } = await supabase
    .from('employees')
    .select('role, name')
    .eq('auth_id', data.user.id)
    .single()

  if (!profile) {
    await supabase.auth.signOut()
    return { error: 'Employee profile not found. Silakan hubungi admin.' }
  }

  // Force revalidation so proxy.ts + server components get fresh session
  revalidatePath('/', 'layout')
  
  if (profile.role === 'admin') {
    redirect('/admin')
  } else if (profile.role === 'kiosk_security') {
    redirect('/kiosk')
  } else {
    redirect('/dashboard')
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
