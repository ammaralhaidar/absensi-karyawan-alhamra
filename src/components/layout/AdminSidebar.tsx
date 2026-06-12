"use client";

import { AlertTriangle, Calendar, CheckCircle, LayoutDashboard, LogOut, Menu, X, ChevronLeft, Users, Building2, Clock4, ScrollText, ClipboardList } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useAuth } from "@/lib/auth-context";
import { useSupabase } from "@/lib/supabase/provider";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, section: "main" },
  { href: "/admin/employees", label: "Karyawan", icon: Users, section: "main" },
  { href: "/admin/departments", label: "Departemen", icon: Building2, section: "main" },
  { href: "/admin/shifts", label: "Shift", icon: Clock4, section: "main" },
  { href: "/admin/approvals", label: "Approval", icon: CheckCircle, section: "ops" },
  { href: "/admin/reports", label: "Laporan", icon: Calendar, section: "ops" },
  { href: "/admin/roster", label: "Roster", icon: ScrollText, section: "ops" },
  { href: "/admin/activity-log", label: "Activity Log", icon: ClipboardList, section: "ops" },
  { href: "/admin", label: "Anomali", icon: AlertTriangle, section: "ops" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const NavContent = ({ onNavigate }: { onNavigate?: () => void }) => {
    const mainItems = navItems.filter((i) => i.section === "main");
    const opsItems = navItems.filter((i) => i.section === "ops");

    return (
      <nav className="flex-1 py-3 px-2 space-y-4 overflow-y-auto">
        <div className="space-y-0.5">
          {mainItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} onClick={onNavigate}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-white/15 text-white shadow-sm"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 shrink-0", isActive && "drop-shadow-sm")} />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
        <div className="border-t border-white/10 pt-3">
          <p className="text-[10px] font-semibold uppercase text-white/30 tracking-wider px-3 mb-1">
            Operasional
          </p>
          <div className="space-y-0.5">
            {opsItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href} onClick={onNavigate}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-white/15 text-white shadow-sm"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 shrink-0", isActive && "drop-shadow-sm")} />
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-primary text-white flex-col shadow-xl shrink-0">
        <SidebarHeader />
        <NavContent />
        <SidebarFooter />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 fixed top-3 left-3 z-30">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-primary text-white border-r-0">
            <VisuallyHidden>
              <SheetTitle>Navigasi Admin</SheetTitle>
            </VisuallyHidden>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <SidebarLogo />
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
              </div>
              <NavContent onNavigate={() => {
                const closeBtn = document.querySelector('[data-slot="sheet-close"]') as HTMLButtonElement;
                closeBtn?.click();
              }} />
              <SidebarFooter />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

function SidebarHeader() {
  return (
    <div className="p-5 border-b border-white/10">
      <SidebarLogo />
      <p className="text-xs text-white/50 mt-0.5 pl-11">Admin Dashboard</p>
    </div>
  );
}

function SidebarLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center shrink-0">
        <Calendar className="w-5 h-5 text-white" />
      </div>
      <div>
        <h1 className="text-base font-bold leading-tight">Alhamra</h1>
        <p className="text-[10px] text-white/60 leading-tight">Attendance</p>
      </div>
    </div>
  );
}

function SidebarFooter() {
  const { logout } = useAuth();
  const { signOut: supabaseSignOut } = useSupabase();
  const handleLogout = () => { logout(); supabaseSignOut(); };
  return (
    <div className="p-3 border-t border-white/10">
      <Button
        variant="ghost"
        className="w-full justify-start text-white/60 hover:text-white hover:bg-white/10 text-sm font-normal"
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4 mr-3" />
        Keluar
      </Button>
    </div>
  );
}
