"use client";

import { Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types";

interface NotificationsProps {
  notifications: Notification[];
}

export function Notifications({ notifications }: NotificationsProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / 3600000);
    if (diffHrs < 1) return "Baru saja";
    if (diffHrs < 24) return `${diffHrs} jam lalu`;
    return `${Math.floor(diffHrs / 24)} hari lalu`;
  };

  const typeStyles: Record<string, string> = {
    info: "border-l-blue-500 bg-blue-50",
    success: "border-l-green-500 bg-green-50",
    warning: "border-l-amber-500 bg-amber-50",
    error: "border-l-red-500 bg-red-50",
  };

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="icon"
        className="text-slate-500 hover:text-[#164e7f] hover:bg-[#164e7f]/5 relative"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount}
          </span>
        )}
      </Button>

      <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded-lg border shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
        <div className="p-2 border-b">
          <p className="text-xs font-semibold text-slate-700">Notifikasi</p>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                "px-3 py-2 border-l-2 border-transparent hover:bg-slate-50 cursor-pointer transition-colors",
                !n.read && typeStyles[n.type]
              )}
            >
              <p className={cn("text-xs font-medium", n.read ? "text-slate-600" : "text-slate-800")}>
                {n.title}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{n.description}</p>
              <p className="text-[10px] text-slate-300 mt-0.5">{formatTime(n.created_at)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
