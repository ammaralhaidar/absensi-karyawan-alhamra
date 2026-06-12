"use client";

import { createBrowserClient } from '@supabase/ssr'
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
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
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  ), []);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
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
              department_name: Array.isArray(data.departments) ? data.departments[0]?.name ?? '' : (data.departments as unknown as { name: string })?.name ?? '',
              avatar_url: data.avatar_url,
            });
          }
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
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
        department_name: Array.isArray(data.departments) ? data.departments[0]?.name ?? '' : (data.departments as unknown as { name: string })?.name ?? '',
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
