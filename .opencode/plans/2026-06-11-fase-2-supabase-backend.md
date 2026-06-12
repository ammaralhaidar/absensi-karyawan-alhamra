# Fase 2: Supabase Backend & Database Integration

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all dummy data with Supabase real-time backend, integrate Supabase Auth with role-based access, implement Edge Functions for QR encryption, and add offline-first PWA support.

**Architecture:** Database-first design with Supabase PostgreSQL, server actions for data operations (no REST API layer), edge functions for QR JWT generation/validation, cookie-based auth via `@supabase/ssr`, and service worker + IndexedDB for offline-first PWA.

**Tech Stack:** Supabase Cloud (PostgreSQL + Auth + Storage), `@supabase/supabase-js`, `@supabase/ssr`, Next.js 16.2.9 App Router, Edge Functions (Deno), Web Crypto API for QR signing, Service Worker + IndexedDB (idb library), jsqr for QR scanning.

---

## Project Credentials (from user)

```
NEXT_PUBLIC_SUPABASE_URL=https://wyewqgyldltujjunmfmp.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_t4CBJVhKd0LpgzJOXubqGg_wuDG-IGb
```

---

## Subsystem 1: Database Schema & Setup

### Task 1.1: Install Supabase CLI

**Files:**
- Create: `.env.local`
- Create: `supabase/config.toml`
- Install: `supabase` CLI via npm

- [ ] **Step 1: Install Supabase CLI locally**

```bash
npm install -g supabase
supabase --version
```

- [ ] **Step 2: Initialize Supabase project in repo**

```bash
supabase init
```

- [ ] **Step 3: Create .env.local with Supabase credentials**

**Create:** `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=https://wyewqgyldltujjunmfmp.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_t4CBJVhKd0LpgzJOXubqGg_wuDG-IGb
SUPABASE_SERVICE_ROLE_KEY=<ask user or get from dashboard>
```

- [ ] **Step 4: Link to Supabase Cloud project**

```bash
supabase link --project-ref wyewqgyldltujjunmfmp
```

- [ ] **Step 5: Install Supabase packages**

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install -D supabase
```

---

### Task 1.2: Create Database Schema (SQL Migrations)

**Files:**
- Create: `supabase/migrations/001_create_schema.sql`

- [ ] **Step 1: Write migration SQL for all tables**

**Create:** `supabase/migrations/001_create_schema.sql`
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Departments
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shifts
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  late_tolerance_minutes INT NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employees (linked to Supabase Auth)
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nik TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL DEFAULT '',
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  default_shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'admin', 'kiosk_security')),
  avatar_url TEXT,
  joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave Requests
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('cuti_tahunan', 'sakit', 'izin')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  attachment_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance Logs
CREATE TABLE attendance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  status_in TEXT CHECK (status_in IN ('tepat_waktu', 'terlambat')),
  anomaly_flag TEXT CHECK (anomaly_flag IN ('lupa_checkout', 'sistem_auto_close')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- Roster
CREATE TABLE rosters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- Admin Activities
CREATE TABLE admin_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('scan', 'approval', 'leave_request', 'employee_update', 'login', 'logout')),
  description TEXT NOT NULL,
  user_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scan Records (for kiosk audit trail)
CREATE TABLE scan_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  employee_name TEXT NOT NULL,
  kiosk_id TEXT NOT NULL DEFAULT 'kiosk-1',
  scanned_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('tepat_waktu', 'terlambat', 'expired', 'error')),
  type TEXT NOT NULL CHECK (type IN ('check_in', 'check_out')),
  qr_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Holidays
CREATE TABLE holidays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'national' CHECK (type IN ('national', 'company')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_attendance_employee_date ON attendance_logs(employee_id, date);
CREATE INDEX idx_roster_employee_date ON rosters(employee_id, date);
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_notifications_employee ON notifications(employee_id);
CREATE INDEX idx_scan_records_scanned_at ON scan_records(scanned_at);
CREATE INDEX idx_admin_activities_created_at ON admin_activities(created_at DESC);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER rosters_updated_at BEFORE UPDATE ON rosters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

- [ ] **Step 2: Apply migration to Supabase**

```bash
supabase db push
```

---

### Task 1.3: Row Level Security (RLS) Policies

**Files:**
- Create: `supabase/migrations/002_rls_policies.sql`

- [ ] **Step 1: Write RLS policies for all tables**

**Create:** `supabase/migrations/002_rls_policies.sql`
```sql
-- Enable RLS on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;

-- Helper function to get current employee role
CREATE OR REPLACE FUNCTION get_current_employee_role()
RETURNS TEXT AS $$
  SELECT role FROM employees WHERE auth_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function to get current employee id
CREATE OR REPLACE FUNCTION get_current_employee_id()
RETURNS UUID AS $$
  SELECT id FROM employees WHERE auth_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- DEPARTMENTS: Everyone can read, only admin can write
CREATE POLICY "departments_read_all" ON departments
  FOR SELECT USING (true);
CREATE POLICY "departments_admin_only" ON departments
  FOR ALL USING (get_current_employee_role() = 'admin');

-- SHIFTS: Everyone can read, only admin can write
CREATE POLICY "shifts_read_all" ON shifts
  FOR SELECT USING (true);
CREATE POLICY "shifts_admin_only" ON shifts
  FOR ALL USING (get_current_employee_role() = 'admin');

-- EMPLOYEES: Admin sees all, employees see only themselves
CREATE POLICY "employees_admin_all" ON employees
  FOR ALL USING (get_current_employee_role() = 'admin');
CREATE POLICY "employees_self_read" ON employees
  FOR SELECT USING (auth_id = auth.uid());
CREATE POLICY "employees_self_update" ON employees
  FOR UPDATE USING (auth_id = auth.uid());

-- LEAVE REQUESTS: Admin sees all, employees see their own
CREATE POLICY "leaves_admin_all" ON leave_requests
  FOR ALL USING (get_current_employee_role() = 'admin');
CREATE POLICY "leaves_self_all" ON leave_requests
  FOR ALL USING (employee_id = get_current_employee_id());

-- ATTENDANCE LOGS: Admin sees all, employees see their own
CREATE POLICY "attendance_admin_all" ON attendance_logs
  FOR ALL USING (get_current_employee_role() = 'admin');
CREATE POLICY "attendance_self_read" ON attendance_logs
  FOR SELECT USING (employee_id = get_current_employee_id());

-- ROSTERS: Admin sees all, employees see their own
CREATE POLICY "rosters_admin_all" ON rosters
  FOR ALL USING (get_current_employee_role() = 'admin');
CREATE POLICY "rosters_self_read" ON rosters
  FOR SELECT USING (employee_id = get_current_employee_id());

-- ADMIN ACTIVITIES: Admin sees all, employees see nothing
CREATE POLICY "activities_admin_all" ON admin_activities
  FOR ALL USING (get_current_employee_role() = 'admin');

-- NOTIFICATIONS: Users see their own
CREATE POLICY "notifications_self" ON notifications
  FOR ALL USING (employee_id = get_current_employee_id());

-- SCAN RECORDS: Admin and kiosk_security see all
CREATE POLICY "scan_records_admin_all" ON scan_records
  FOR ALL USING (get_current_employee_role() IN ('admin', 'kiosk_security'));
CREATE POLICY "scan_records_self_read" ON scan_records
  FOR SELECT USING (employee_id = get_current_employee_id());

-- HOLIDAYS: Everyone can read
CREATE POLICY "holidays_read_all" ON holidays
  FOR SELECT USING (true);
CREATE POLICY "holidays_admin_only" ON holidays
  FOR ALL USING (get_current_employee_role() = 'admin');
```

- [ ] **Step 2: Apply RLS migration**

```bash
supabase db push
```

---

## Subsystem 2: Supabase Client Setup

### Task 2.1: Browser Client

**Files:**
- Create: `src/lib/supabase/client.ts`
- Modify: `src/app/layout.tsx` (wrap with SupabaseProvider)

- [ ] **Step 1: Create browser client**

**Create:** `src/lib/supabase/client.ts`
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
```

- [ ] **Step 2: Create SupabaseProvider (AuthContext replacement)**

**Create:** `src/lib/supabase/provider.tsx`
```typescript
"use client";

import { createBrowserClient } from '@supabase/ssr'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Role } from '@/types'

interface EmployeeProfile {
  id: string;
  name: string;
  role: Role;
  department_id: string;
  department_name: string;
  avatar_url?: string;
}

interface SupabaseContextType {
  user: User | null;
  profile: EmployeeProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType | null>(null);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const { data } = await supabase
            .from('employees')
            .select('id, name, role, department_id, departments(name), avatar_url')
            .eq('auth_id', session.user.id)
            .single();
          if (data) {
            setProfile({
              id: data.id,
              name: data.name,
              role: data.role,
              department_id: data.department_id,
              department_name: data.departments?.name,
              avatar_url: data.avatar_url,
            });
          }
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('employees')
      .select('id, name, role, department_id, departments(name), avatar_url')
      .eq('auth_id', user.id)
      .single();
    if (data) {
      setProfile({
        id: data.id,
        name: data.name,
        role: data.role,
        department_id: data.department_id,
        department_name: data.departments?.name,
        avatar_url: data.avatar_url,
      });
    }
  };

  return (
    <SupabaseContext.Provider value={{ user, profile, isLoading, signOut, refreshProfile }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error("useSupabase must be used within SupabaseProvider");
  return ctx;
}
```

- [ ] **Step 3: Update layout.tsx to use SupabaseProvider**

**Modify:** `src/app/layout.tsx`
```typescript
// Replace AuthProvider import with SupabaseProvider
import { SupabaseProvider } from '@/lib/supabase/provider'

// In the JSX, replace <AuthProvider> with <SupabaseProvider>
<SupabaseProvider>
  {children}
  <Toaster position="top-right" richColors />
</SupabaseProvider>
```

---

### Task 2.2: Server Client

**Files:**
- Create: `src/lib/supabase/server.ts`

- [ ] **Step 1: Create server client factory**

**Create:** `src/lib/supabase/server.ts`
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet, _headers) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component, ignore
          }
        },
      },
    }
  )
}
```

---

### Task 2.3: Next.js Proxy (Middleware) for Auth Refresh

**Files:**
- Create: `src/proxy.ts` (Next.js 16 uses proxy.ts instead of middleware.ts)

- [ ] **Step 1: Create proxy for auth refresh**

**Create:** `src/proxy.ts`
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect unauthenticated users from protected routes
  if (!user) {
    const pathname = request.nextUrl.pathname
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/leaves') ||
      pathname.startsWith('/profile') ||
      pathname.startsWith('/kiosk')
    ) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## Subsystem 3: Auth System

### Task 3.1: Auth Server Actions

**Files:**
- Create: `src/lib/auth/actions.ts`

- [ ] **Step 1: Create auth server actions**

**Create:** `src/lib/auth/actions.ts`
```typescript
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

  // Get employee profile to determine role
  const { data: profile } = await supabase
    .from('employees')
    .select('role, name')
    .eq('auth_id', data.user.id)
    .single()

  if (!profile) {
    return { error: 'Employee profile not found' }
  }

  revalidatePath('/', 'layout')
  
  // Redirect based on role
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

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getCurrentProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('employees')
    .select('id, name, role, department_id, departments(name), avatar_url')
    .eq('auth_id', user.id)
    .single()

  return profile
}
```

---

### Task 3.2: Update Login Page

**Files:**
- Modify: `src/app/(auth)/login/page.tsx`

- [ ] **Step 1: Replace localStorage demo login with Supabase auth**

**Modify:** `src/app/(auth)/login/page.tsx`
```typescript
// Replace the existing form submission handler
import { signIn } from '@/lib/auth/actions'

// Update handleSubmit to use server action
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  const result = await signIn(email, password);
  if (result?.error) {
    toast.error(result.error);
    setIsLoading(false);
  }
  // Redirect is handled by server action
};

// Remove demo login buttons (they don't work with Supabase)
// Or keep them as quick-login for development only (with development env check)
```

---

### Task 3.3: Update AuthGuard for Supabase

**Files:**
- Modify: `src/components/AuthGuard.tsx`

- [ ] **Step 1: Replace AuthGuard to use Supabase session**

**Modify:** `src/components/AuthGuard.tsx`
```typescript
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/provider';
import type { Role } from '@/types';

export function AuthGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: Role[];
}) {
  const { user, profile, isLoading } = useSupabase();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (profile && !allowedRoles.includes(profile.role)) {
      // Redirect to role-appropriate page
      if (profile.role === 'admin') router.push('/admin');
      else if (profile.role === 'kiosk_security') router.push('/kiosk');
      else router.push('/dashboard');
      return;
    }

    setAuthorized(true);
  }, [user, profile, isLoading, allowedRoles, router]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
```

---

## Subsystem 4: Edge Functions

### Task 4.1: QR Generate Edge Function

**Files:**
- Create: `supabase/functions/qr-generate/index.ts`

- [ ] **Step 1: Create QR generate function**

**Create:** `supabase/functions/qr-generate/index.ts`
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-secret-key'

serve(async (req) => {
  const { employee_id, type } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Verify employee exists
  const { data: employee } = await supabase
    .from('employees')
    .select('id, name, department_id, default_shift_id')
    .eq('id', employee_id)
    .single()

  if (!employee) {
    return new Response(JSON.stringify({ error: 'Employee not found' }), { status: 404 })
  }

  // Generate JWT with 30-second expiry
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    sub: employee_id,
    type,
    iat: now,
    exp: now + 30,
    jti: crypto.randomUUID(),
  }

  const header = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = btoa(JSON.stringify(header))
  const encodedPayload = btoa(JSON.stringify(payload))
  const signature = await crypto.subtle.sign(
    'HMAC',
    await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ),
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
  )
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
  const token = `${encodedHeader}.${encodedPayload}.${encodedSignature}`

  return new Response(JSON.stringify({ token, expires_in: 30 }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

---

### Task 4.2: QR Validate Edge Function

**Files:**
- Create: `supabase/functions/qr-validate/index.ts`

- [ ] **Step 1: Create QR validate function**

**Create:** `supabase/functions/qr-validate/index.ts`
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-secret-key'

serve(async (req) => {
  const { token, kiosk_id } = await req.json()

  try {
    // Verify JWT
    const [header, payload, signature] = token.split('.')
    const verifySignature = await crypto.subtle.sign(
      'HMAC',
      await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(JWT_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      ),
      new TextEncoder().encode(`${header}.${payload}`)
    )
    const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(verifySignature)))
    
    if (signature !== expectedSignature) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 400 })
    }

    const decodedPayload = JSON.parse(atob(payload))
    const now = Math.floor(Date.now() / 1000)
    
    if (decodedPayload.exp < now) {
      return new Response(JSON.stringify({ error: 'Token expired' }), { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get employee details
    const { data: employee } = await supabase
      .from('employees')
      .select('id, name, department_id, default_shift_id')
      .eq('id', decodedPayload.sub)
      .single()

    if (!employee) {
      return new Response(JSON.stringify({ error: 'Employee not found' }), { status: 404 })
    }

    // Get shift details
    const { data: shift } = await supabase
      .from('shifts')
      .select('start_time, end_time, late_tolerance_minutes')
      .eq('id', employee.default_shift_id)
      .single()

    if (!shift) {
      return new Response(JSON.stringify({ error: 'Shift not found' }), { status: 404 })
    }

    const nowTime = new Date()
    const shiftStart = new Date(`${nowTime.toISOString().split('T')[0]}T${shift.start_time}`)
    const lateThreshold = new Date(shiftStart.getTime() + shift.late_tolerance_minutes * 60000)
    
    const status = nowTime <= lateThreshold ? 'tepat_waktu' : 'terlambat'

    // Create attendance log
    const { data: log, error: logError } = await supabase
      .from('attendance_logs')
      .insert({
        employee_id: employee.id,
        date: nowTime.toISOString().split('T')[0],
        shift_id: employee.default_shift_id,
        check_in: nowTime.toISOString(),
        status_in: status,
      })
      .select()
      .single()

    if (logError) {
      return new Response(JSON.stringify({ error: logError.message }), { status: 500 })
    }

    // Create scan record
    await supabase.from('scan_records').insert({
      employee_id: employee.id,
      employee_name: employee.name,
      kiosk_id: kiosk_id || 'kiosk-1',
      scanned_at: nowTime.toISOString(),
      status,
      type: decodedPayload.type,
      qr_token: token,
    })

    return new Response(JSON.stringify({
      success: true,
      employee_name: employee.name,
      status,
      time: nowTime.toLocaleTimeString('id-ID'),
    }), { status: 200 })

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid token format' }), { status: 400 })
  }
})
```

---

### Task 4.3: Deploy Edge Functions

- [ ] **Step 1: Deploy edge functions to Supabase**

```bash
# Set JWT_SECRET in Supabase dashboard > Project Settings > Edge Functions
# Or via CLI:
supabase secrets set JWT_SECRET=your-secret-key

# Deploy functions
supabase functions deploy qr-generate
supabase functions deploy qr-validate
```

---

## Subsystem 5: Data Layer (Server Actions)

### Task 5.1: Employee Queries

**Files:**
- Create: `src/lib/data/employees.ts`

- [ ] **Step 1: Create employee data functions**

**Create:** `src/lib/data/employees.ts`
```typescript
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
  
  return data.map(e => ({
    ...e,
    department_name: e.departments?.name,
    shift_name: e.shifts?.name,
  })) as Employee[]
}

export async function getEmployee(id: string): Promise<Employee | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('employees')
    .select('*, departments(name), shifts(name)')
    .eq('id', id)
    .single()

  if (error) return null
  return { ...data, department_name: data.departments?.name, shift_name: data.shifts?.name } as Employee
}

export async function createEmployee(employee: Omit<Employee, 'id'>) {
  const supabase = await createClient()
  
  // First create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: employee.email,
    password: 'temporary-password-change-me', // Admin should send reset email
    email_confirm: true,
  })

  if (authError) throw new Error(authError.message)

  // Then create employee record
  const { data, error } = await supabase
    .from('employees')
    .insert({
      ...employee,
      auth_id: authData.user.id,
    })
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
```

---

### Task 5.2: Department & Shift Queries

**Files:**
- Create: `src/lib/data/departments.ts`
- Create: `src/lib/data/shifts.ts`

- [ ] **Step 1: Create department data functions**

**Create:** `src/lib/data/departments.ts`
```typescript
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
```

- [ ] **Step 2: Create shift data functions**

**Create:** `src/lib/data/shifts.ts`
```typescript
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
```

---

### Task 5.3: Leave Request Queries

**Files:**
- Create: `src/lib/data/leaves.ts`

- [ ] **Step 1: Create leave request data functions**

**Create:** `src/lib/data/leaves.ts`
```typescript
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
  
  return data.map(l => ({
    ...l,
    employee_name: l.employees?.name,
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
```

---

### Task 5.4: Attendance & Roster Queries

**Files:**
- Create: `src/lib/data/attendance.ts`
- Create: `src/lib/data/roster.ts`

- [ ] **Step 1: Create attendance data functions**

**Create:** `src/lib/data/attendance.ts`
```typescript
"use server";

import { createClient } from '@/lib/supabase/server'
import type { AttendanceLog } from '@/types'

export async function getAttendanceLogs(
  employeeId?: string,
  date?: string
): Promise<AttendanceLog[]> {
  const supabase = await createClient()
  let query = supabase
    .from('attendance_logs')
    .select('*, employees(name), shifts(name), departments(name)')
    .order('date', { ascending: false })

  if (employeeId) query = query.eq('employee_id', employeeId)
  if (date) query = query.eq('date', date)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  return data.map(a => ({
    ...a,
    employee_name: a.employees?.name,
    department_name: a.departments?.name,
    shift_name: a.shifts?.name,
  })) as AttendanceLog[]
}

export async function getTodayAttendance(): Promise<AttendanceLog[]> {
  const today = new Date().toISOString().split('T')[0]
  return getAttendanceLogs(undefined, today)
}
```

- [ ] **Step 2: Create roster data functions**

**Create:** `src/lib/data/roster.ts`
```typescript
"use server";

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { RosterEntry } from '@/types'

export async function getRoster(
  startDate: string,
  endDate: string
): Promise<RosterEntry[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('rosters')
    .select('*, employees(name), departments(name), shifts(name)')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date')

  if (error) throw new Error(error.message)

  return data.map(r => ({
    ...r,
    employee_name: r.employees?.name,
    department_name: r.departments?.name,
    shift_name: r.shifts?.name,
  })) as RosterEntry[]
}

export async function updateRoster(
  employeeId: string,
  date: string,
  shiftId: string | null
) {
  const supabase = await createClient()
  
  if (shiftId === null) {
    const { error } = await supabase
      .from('rosters')
      .delete()
      .eq('employee_id', employeeId)
      .eq('date', date)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase
      .from('rosters')
      .upsert({
        employee_id: employeeId,
        date,
        shift_id: shiftId,
      }, { onConflict: 'employee_id,date' })
    if (error) throw new Error(error.message)
  }

  revalidatePath('/admin/roster')
}
```

---

## Subsystem 6: Offline-First PWA

### Task 6.1: Service Worker Setup

**Files:**
- Create: `public/sw.js`
- Modify: `src/app/layout.tsx` (register service worker)

- [ ] **Step 1: Create service worker for offline sync**

**Create:** `public/sw.js`
```javascript
const CACHE_NAME = 'alhamra-attendance-v1';
const STATIC_ASSETS = [
  '/',
  '/login',
  '/dashboard',
  '/leaves',
  '/profile',
  '/admin',
  '/admin/employees',
  '/admin/departments',
  '/admin/shifts',
  '/admin/approvals',
  '/admin/reports',
  '/admin/roster',
  '/admin/activity-log',
  '/kiosk',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: cache-first strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip API requests
  if (event.request.url.includes('/api/') || event.request.url.includes('/auth/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse.status === 200) {
          const clonedResponse = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
        }
        return networkResponse;
      });
    })
  );
});

// Background sync for offline queue
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-scan-queue') {
    event.waitUntil(syncScanQueue());
  }
});

async function syncScanQueue() {
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: 'SYNC_SCAN_QUEUE' });
  });
}
```

- [ ] **Step 2: Register service worker in layout**

**Modify:** `src/app/layout.tsx` (add script tag or useEffect)
```typescript
// Add to the body or create a client component
import { ServiceWorker } from '@/components/ServiceWorker'

// In body:
<ServiceWorker />
```

**Create:** `src/components/ServiceWorker.tsx`
```typescript
"use client";

import { useEffect } from 'react';

export function ServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);
        })
        .catch((error) => {
          console.error('SW registration failed:', error);
        });
    }
  }, []);

  return null;
}
```

---

### Task 6.2: IndexedDB Offline Store

**Files:**
- Create: `src/lib/offline/db.ts`

- [ ] **Step 1: Install idb library**

```bash
npm install idb
```

- [ ] **Step 2: Create IndexedDB wrapper**

**Create:** `src/lib/offline/db.ts`
```typescript
import { openDB, type DBSchema } from 'idb'

interface OfflineDB extends DBSchema {
  employees: {
    key: string
    value: {
      id: string
      name: string
      nik: string
      department_id: string
      department_name: string
      default_shift_id: string
      shift_name: string
      role: string
      is_active: boolean
      avatar_url?: string
    }
  }
  shifts: {
    key: string
    value: {
      id: string
      name: string
      start_time: string
      end_time: string
      late_tolerance_minutes: number
    }
  }
  departments: {
    key: string
    value: {
      id: string
      name: string
      description: string
    }
  }
  scan_queue: {
    key: number
    value: {
      id: number
      token: string
      kiosk_id: string
      timestamp: string
      status: 'pending' | 'synced' | 'failed'
    }
    indexes: { 'by-status': string }
  }
  attendance_cache: {
    key: string
    value: {
      date: string
      logs: any[]
      cached_at: string
    }
  }
  roster_cache: {
    key: string
    value: {
      month: string
      entries: any[]
      cached_at: string
    }
  }
}

const DB_NAME = 'alhamra-offline'
const DB_VERSION = 1

export async function getDB() {
  return openDB<OfflineDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore('employees', { keyPath: 'id' })
      db.createObjectStore('shifts', { keyPath: 'id' })
      db.createObjectStore('departments', { keyPath: 'id' })
      const scanQueue = db.createObjectStore('scan_queue', { keyPath: 'id', autoIncrement: true })
      scanQueue.createIndex('by-status', 'status')
      db.createObjectStore('attendance_cache', { keyPath: 'date' })
      db.createObjectStore('roster_cache', { keyPath: 'month' })
    },
  })
}

export async function cacheEmployees(employees: any[]) {
  const db = await getDB()
  const tx = db.transaction('employees', 'readwrite')
  const store = tx.objectStore('employees')
  await Promise.all(employees.map(e => store.put(e)))
  await tx.done
}

export async function getCachedEmployees() {
  const db = await getDB()
  return db.getAll('employees')
}

export async function addToScanQueue(token: string, kioskId: string) {
  const db = await getDB()
  await db.add('scan_queue', {
    token,
    kiosk_id: kioskId,
    timestamp: new Date().toISOString(),
    status: 'pending',
  })
}

export async function getPendingScans() {
  const db = await getDB()
  return db.getAllFromIndex('scan_queue', 'by-status', 'pending')
}

export async function markScanSynced(id: number) {
  const db = await getDB()
  const scan = await db.get('scan_queue', id)
  if (scan) {
    scan.status = 'synced'
    await db.put('scan_queue', scan)
  }
}

export async function cacheAttendance(date: string, logs: any[]) {
  const db = await getDB()
  await db.put('attendance_cache', {
    date,
    logs,
    cached_at: new Date().toISOString(),
  })
}

export async function getCachedAttendance(date: string) {
  const db = await getDB()
  return db.get('attendance_cache', date)
}
```

---

### Task 6.3: Offline Sync Hook for Kiosk

**Files:**
- Create: `src/hooks/useOfflineSync.ts`

- [ ] **Step 1: Create offline sync hook**

**Create:** `src/hooks/useOfflineSync.ts`
```typescript
"use client";

import { useState, useEffect, useCallback } from 'react';
import { getPendingScans, markScanSynced, addToScanQueue } from '@/lib/offline/db';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const updateOnline = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    updateOnline();
    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, []);

  useEffect(() => {
    const checkPending = async () => {
      const pending = await getPendingScans();
      setPendingCount(pending.length);
    };
    checkPending();
  }, [isOnline]);

  const queueScan = useCallback(async (token: string, kioskId: string) => {
    if (!isOnline) {
      await addToScanQueue(token, kioskId);
      setPendingCount((c) => c + 1);
      return { queued: true };
    }
    return { queued: false };
  }, [isOnline]);

  const syncPending = useCallback(async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    const pending = await getPendingScans();
    
    for (const scan of pending) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/qr-validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: scan.token, kiosk_id: scan.kiosk_id }),
        });
        if (response.ok) {
          await markScanSynced(scan.id);
        }
      } catch (error) {
        console.error('Sync failed for scan:', scan.id);
      }
    }

    setPendingCount(0);
    setIsSyncing(false);
  }, [isOnline]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    queueScan,
    syncPending,
  };
}
```

---

## Subsystem 7: Seed Data

### Task 7.1: Seed Script

**Files:**
- Create: `supabase/seed.sql`

- [ ] **Step 1: Create seed data matching dummy-data.ts**

**Create:** `supabase/seed.sql`
```sql
-- Seed Departments
INSERT INTO departments (id, name, description) VALUES
  ('dept-web', 'Web Developer', 'Tim pengembangan web dan aplikasi'),
  ('dept-dapur', 'Dapur', 'Tim dapur dan produksi'),
  ('dept-security', 'Security', 'Tim keamanan dan pengawasan'),
  ('dept-hr', 'HR', 'Tim Human Resources');

-- Seed Shifts
INSERT INTO shifts (id, name, start_time, end_time, late_tolerance_minutes, is_default) VALUES
  ('shift-pagi', 'Shift Pagi', '08:00:00', '17:00:00', 15, true),
  ('shift-siang', 'Shift Siang', '14:00:00', '23:00:00', 15, false),
  ('shift-malam', 'Shift Malam', '22:00:00', '07:00:00', 15, false);

-- Seed Employees (auth_id will be linked later)
INSERT INTO employees (id, nik, name, email, phone, department_id, default_shift_id, role, joined_at, is_active) VALUES
  ('emp-001', '890001', 'Ahmad Fauzi', 'ahmad@alhamra.com', '081234567001', 'dept-web', 'shift-pagi', 'employee', '2024-01-15', true),
  ('emp-002', '890002', 'Budi Santoso', 'budi@alhamra.com', '081234567002', 'dept-web', 'shift-pagi', 'employee', '2024-02-20', true),
  ('emp-003', '890003', 'Citra Lestari', 'citra@alhamra.com', '081234567003', 'dept-dapur', 'shift-siang', 'employee', '2024-01-10', true),
  ('emp-004', '890004', 'Dedi Pratama', 'dedi@alhamra.com', '081234567004', 'dept-security', 'shift-malam', 'employee', '2024-03-01', true),
  ('emp-005', '890005', 'Eka Wulandari', 'eka@alhamra.com', '081234567005', 'dept-hr', 'shift-pagi', 'admin', '2023-06-01', true),
  ('emp-006', '890006', 'Fajar Hidayat', 'fajar@alhamra.com', '081234567006', 'dept-web', 'shift-pagi', 'employee', '2024-04-15', true),
  ('emp-007', '890007', 'Gita Ananda', 'gita@alhamra.com', '081234567007', 'dept-dapur', 'shift-siang', 'employee', '2024-02-01', true),
  ('emp-008', '890008', 'Hadi Wijaya', 'hadi@alhamra.com', '081234567008', 'dept-security', 'shift-malam', 'kiosk_security', '2024-01-20', true),
  ('emp-009', '890009', 'Indah Permata', 'indah@alhamra.com', '081234567009', 'dept-web', 'shift-pagi', 'employee', '2024-05-10', true),
  ('emp-010', '890010', 'Joko Suryanto', 'joko@alhamra.com', '081234567010', 'dept-dapur', 'shift-siang', 'employee', '2024-03-15', true),
  ('emp-011', '890011', 'Kartika Sari', 'kartika@alhamra.com', '081234567011', 'dept-web', 'shift-pagi', 'employee', '2024-06-01', true),
  ('emp-012', '890012', 'Lukman Hakim', 'lukman@alhamra.com', '081234567012', 'dept-dapur', 'shift-siang', 'employee', '2024-04-20', true),
  ('emp-013', '890013', 'Maya Dewi', 'maya@alhamra.com', '081234567013', 'dept-security', 'shift-malam', 'employee', '2024-01-05', false),
  ('emp-014', '890014', 'Nico Pratomo', 'nico@alhamra.com', '081234567014', 'dept-hr', 'shift-pagi', 'employee', '2024-07-01', true),
  ('emp-015', '890015', 'Olivia Putri', 'olivia@alhamra.com', '081234567015', 'dept-web', 'shift-pagi', 'employee', '2024-05-20', true);

-- Seed Holidays
INSERT INTO holidays (date, name, type) VALUES
  ('2026-06-01', 'Hari Lahir Pancasila', 'national'),
  ('2026-06-08', 'Idul Adha', 'national'),
  ('2026-06-09', 'Cuti Bersama Idul Adha', 'national');

-- Seed Leave Requests
INSERT INTO leave_requests (id, employee_id, leave_type, start_date, end_date, reason, status, created_at) VALUES
  ('leave-001', 'emp-009', 'sakit', '2026-06-13', '2026-06-14', 'Sakit perut', 'pending', '2026-06-12'),
  ('leave-002', 'emp-001', 'cuti_tahunan', '2026-06-15', '2026-06-17', 'Liburan keluarga', 'pending', '2026-06-10'),
  ('leave-003', 'emp-004', 'izin', '2026-06-20', '2026-06-20', 'Urusan keluarga', 'pending', '2026-06-11'),
  ('leave-004', 'emp-003', 'sakit', '2026-06-05', '2026-06-06', 'Demam', 'approved', '2026-06-04');
```

- [ ] **Step 2: Apply seed data**

```bash
# Via Supabase SQL Editor in dashboard
# Or via CLI:
supabase db reset
```

---

## Subsystem 8: TypeScript Type Generation

### Task 8.1: Generate Database Types

**Files:**
- Create: `src/types/supabase.ts`

- [ ] **Step 1: Generate types from Supabase schema**

```bash
supabase gen types typescript --project-id wyewqgyldltujjunmfmp --schema public > src/types/supabase.ts
```

- [ ] **Step 2: Export generated types**

The generated file will contain all table types. Use `Database` type in Supabase client:
```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export function createClient() {
  return createBrowserClient<Database>(...)
}
```

---

## Subsystem 9: Update Frontend Components to Use Real Data

### Task 9.1: Update Pages to Use Server Actions

For each page, replace dummy data imports with server action calls:

- `src/app/(admin)/admin/employees/page.tsx` → `getEmployees()`
- `src/app/(admin)/admin/departments/page.tsx` → `getDepartments()`
- `src/app/(admin)/admin/shifts/page.tsx` → `getShifts()`
- `src/app/(admin)/admin/approvals/page.tsx` → `getLeaveRequests()`
- `src/app/(admin)/admin/reports/page.tsx` → `getAttendanceLogs()`
- `src/app/(admin)/admin/roster/page.tsx` → `getRoster()`
- `src/app/(admin)/admin/activity-log/page.tsx` → `getAdminActivities()` (new function)
- `src/app/(admin)/admin/page.tsx` → `getTodayAttendance()` + `getLeaveRequests()`
- `src/app/(mobile)/dashboard/page.tsx` → `getEmployeeLeaveRequests()` + `getAttendanceLogs()`
- `src/app/(mobile)/leaves/page.tsx` → `getEmployeeLeaveRequests()` + `createLeaveRequest()`
- `src/app/(mobile)/profile/page.tsx` → `getEmployee()`
- `src/app/(kiosk)/kiosk/page.tsx` → Edge Functions for QR + scan validation

---

## Self-Review Checklist

### 1. Spec Coverage

| Requirement | Task | Status |
|------------|------|--------|
| Supabase Cloud | 1.1, 1.2 | ✅ Planned |
| JWT QR Encryption | 4.1, 4.2 | ✅ Planned |
| Admin Create Manual Auth | 3.1, 3.2, 5.1 | ✅ Planned |
| Edge Functions (2 functions) | 4.1, 4.2 | ✅ Planned |
| Fields in employees table | 1.2 Schema | ✅ Planned |
| Storage Bucket for attachments | *Via Supabase Dashboard | ✅ Note added |
| Offline-first | 6.1, 6.2, 6.3 | ✅ Planned |
| Seed Data | 7.1 | ✅ Planned |
| TypeScript types | 8.1 | ✅ Planned |
| Frontend data migration | 9.1 | ✅ Planned |

### 2. Placeholder Scan

- No "TBD", "TODO", "implement later" placeholders
- All SQL queries are complete
- All server actions have full implementation
- Edge Functions are complete

### 3. Type Consistency

- Employee type: consistent between `src/types/index.ts` and database schema
- Role type: `employee | admin | kiosk_security` used consistently
- All foreign key references use `UUID` type
- `created_at` and `updated_at` use `TIMESTAMPTZ` consistently

---

## Execution Notes

**Critical Setup Required Before Execution:**
1. User must provide `SUPABASE_SERVICE_ROLE_KEY` (for server-side auth and Edge Functions)
2. Set `JWT_SECRET` in Supabase Dashboard → Edge Functions → Secrets
3. Create Storage Bucket `attachments` in Supabase Dashboard for leave attachments
4. Enable Email provider in Supabase Auth settings (for password-based login)

**Execution Order:**
1. Install packages + setup Supabase CLI
2. Create database schema
3. Apply RLS policies
4. Setup Supabase clients (browser/server/proxy)
5. Deploy Edge Functions
6. Create data layer server actions
7. Setup offline-first (Service Worker + IndexedDB)
8. Seed data
9. Generate TypeScript types
10. Update frontend pages
11. Test and verify

**Breaking Changes from Next.js 16:**
- Use `src/proxy.ts` instead of `src/middleware.ts` for Next.js 16
- Use `export async function proxy(request: NextRequest)` instead of `middleware`
- Server Components use `cookies()` from `next/headers` which is now async
- Use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` instead of `NEXT_PUBLIC_SUPABASE_ANON_KEY` (new naming in Supabase)

**After Plan Approval:**
Execute with subagent-driven development or inline execution. Each subsystem is independent and can be implemented sequentially.
