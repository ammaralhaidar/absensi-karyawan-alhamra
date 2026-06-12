"use client";

import { Calendar, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/lib/auth-context";
import { NotificationBell } from "@/components/features/NotificationBell";

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();

  return (
    <AuthGuard allowedRoles={["employee", "admin"]}>
      <div className="min-h-screen flex flex-col bg-background">
        <header className="sticky top-0 z-20 bg-primary text-white py-3.5 px-4 shadow-md">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold leading-tight">Alhamra</h1>
                <p className="text-[10px] text-white/60 leading-tight">Attendance</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <NotificationBell />
              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white hover:bg-white/15 rounded-full"
                onClick={logout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto max-w-lg mx-auto w-full">
          {children}
        </main>

        <MobileBottomNav />
      </div>
    </AuthGuard>
  );
}
