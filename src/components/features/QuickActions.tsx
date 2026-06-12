"use client";

import { Users, CheckCircle, FileText, Calendar } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const actions = [
  { href: "/admin/employees", label: "Karyawan", icon: Users, color: "bg-[#164e7f]/10 text-[#164e7f] hover:bg-[#164e7f]/20" },
  { href: "/admin/approvals", label: "Approval", icon: CheckCircle, color: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
  { href: "/admin/reports", label: "Laporan", icon: FileText, color: "bg-green-50 text-green-700 hover:bg-green-100" },
  { href: "/admin/roster", label: "Roster", icon: Calendar, color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {actions.map((action) => (
        <Link key={action.href} href={action.href}>
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 cursor-pointer",
            action.color
          )}>
            <action.icon className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">{action.label}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
