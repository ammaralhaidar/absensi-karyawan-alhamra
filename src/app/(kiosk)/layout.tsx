"use client";

import { KioskHeader } from "@/components/layout/KioskHeader";
import { AuthGuard } from "@/components/AuthGuard";

export default function KioskLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["kiosk_security", "admin"]}>
      <div className="min-h-screen bg-gray-50 text-foreground overflow-hidden flex flex-col">
        <KioskHeader />
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </AuthGuard>
  );
}
