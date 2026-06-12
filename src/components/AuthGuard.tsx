"use client";

import { useEffect, useRef, useState } from "react";
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
  const hasChecked = useRef(false);

  const isLoading = supabaseLoading || localLoading;

  // Build activeSession only when not loading, using strict profile check
  const activeSession = !isLoading
    ? (user
        ? profile
          ? { role: profile.role, userId: user.id }
          : null // User exists but profile not loaded yet — stay in loading
        : session)
    : null;

  useEffect(() => {
    if (isLoading) return;
    if (hasChecked.current) return;
    hasChecked.current = true;

    if (!activeSession) {
      router.replace("/login");
      return;
    }
    if (allowedRoles && !allowedRoles.includes(activeSession.role)) {
      if (activeSession.role === "admin") router.replace("/admin");
      else if (activeSession.role === "kiosk_security") router.replace("/kiosk");
      else router.replace("/dashboard");
      return;
    }
    setReady(true);
  }, [activeSession, isLoading, router, allowedRoles]);

  if (isLoading || !activeSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#164e7f]" />
      </div>
    );
  }

  if (!ready) return null;

  return <>{children}</>;
}
