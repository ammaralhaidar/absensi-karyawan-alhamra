"use client";

import { Input } from "@/components/ui/input";
import { Search, User, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Notifications } from "@/components/features/Notifications";
import { NotificationBell } from "@/components/features/NotificationBell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { notifications, employees } from "@/lib/dummy-data";
import { useAuth } from "@/lib/auth-context";
import { useSupabase } from "@/lib/supabase/provider";

const breadcrumbMap: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/employees": "Manajemen Karyawan",
  "/admin/departments": "Manajemen Departemen",
  "/admin/shifts": "Manajemen Shift",
  "/admin/approvals": "Approval Center",
  "/admin/reports": "Laporan & Export",
  "/admin/roster": "Manajemen Roster",
  "/admin/activity-log": "Activity Log",
};

export function AdminHeader() {
  const pathname = usePathname();
  const currentLabel = breadcrumbMap[pathname] ?? pathname;
  const adminUser = employees.find((e) => e.role === "admin");
  const initials = adminUser?.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2) ?? "AD";
  const { logout } = useAuth();
  const { signOut: supabaseSignOut } = useSupabase();
  const handleLogout = () => { logout(); supabaseSignOut(); };

  return (
    <header className="hidden lg:flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-[#164e7f] transition-colors">
            Home
          </Link>
          <span className="text-slate-300">/</span>
          <Link href="/admin" className="hover:text-[#164e7f] transition-colors">
            Admin
          </Link>
          {pathname !== "/admin" && (
            <>
              <span className="text-slate-300">/</span>
              <span className="text-[#164e7f] font-medium">{currentLabel}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            placeholder="Cari..."
            className="w-48 h-8 pl-8 text-xs bg-slate-50 border-slate-200 focus:border-[#164e7f]"
          />
        </div>

        <Notifications notifications={notifications} />

        <NotificationBell />

        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden xl:block">
            <p className="text-xs font-semibold text-slate-700 leading-tight">
              {adminUser?.name ?? "Admin"}
            </p>
            <Badge variant="outline" className="text-[9px] px-1 py-0 h-auto mt-0.5 border-slate-300 text-slate-500">
              Admin
            </Badge>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-500" onClick={handleLogout}>
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
