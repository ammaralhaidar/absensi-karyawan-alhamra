"use client";

import { QrCode, CalendarDays, User, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "QR Code", icon: QrCode },
  { href: "/leaves", label: "Izin", icon: CalendarDays },
  { href: "/profile", label: "Profil", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 bg-white border-t border-border px-2 py-1.5 shadow-[0_-1px_3px_rgba(0,0,0,0.05)] safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors duration-150",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "drop-shadow-sm")} />
              <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
