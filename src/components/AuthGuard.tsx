"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/lib/supabase/provider";
import { useAuth } from "@/lib/auth-context";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: ("employee" | "admin" | "kiosk_security")[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, profile, isLoading: supabaseLoading } = useSupabase();
  const { session, isLoading: localLoading } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  const activeSession = user
    ? { role: profile?.role ?? "employee", userId: user.id }
    : session;
  const isLoading = supabaseLoading || localLoading;

  useEffect(() => {
    if (isLoading) return;
    if (!activeSession) {
      router.push("/login");
      return;
    }
    if (allowedRoles && !allowedRoles.includes(activeSession.role)) {
      if (activeSession.role === "admin") router.push("/admin");
      else if (activeSession.role === "kiosk_security") router.push("/kiosk");
      else router.push("/dashboard");
      return;
    }
    setReady(true);
  }, [activeSession, isLoading, router, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#164e7f]" />
      </div>
    );
  }

  if (!ready) return null;

  return <>{children}</>;
}
