"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: string;
  employee_name: string;
  status: string;
  created_at: string;
}

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const leaveChannel = supabase
      .channel("leave-updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "leave_requests", filter: "status=in.(approved,rejected)" },
        (payload: any) => {
          const newNotif = {
            id: payload.new.id,
            type: "leave_update",
            employee_name: `Leave #${payload.new.id.substring(0, 8)}`,
            status: payload.new.status,
            created_at: new Date().toISOString(),
          };
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);
          toast(
            `Pengajuan ${payload.new.status === "approved" ? "disetujui" : "ditolak"}`,
            { description: `ID: ${payload.new.id.substring(0, 8)}...` }
          );
        }
      )
      .subscribe();

    const scanChannel = supabase
      .channel("scan-updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "scan_records" },
        (payload: any) => {
          const newNotif = {
            id: payload.new.id,
            type: "new_scan",
            employee_name: payload.new.employee_name,
            status: payload.new.status,
            created_at: payload.new.scanned_at,
          };
          setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(leaveChannel);
      supabase.removeChannel(scanChannel);
    };
  }, []);

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      setUnreadCount(0);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleBellClick}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-[10px] bg-red-500 text-white border-0">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-lg border border-slate-200 z-50 max-h-80 overflow-y-auto">
          <div className="p-3 border-b border-slate-100">
            <p className="text-sm font-semibold">Notifikasi</p>
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-400">
              Belum ada notifikasi
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="p-3 border-b border-slate-50 hover:bg-slate-50">
                <p className="text-xs font-medium text-slate-700">
                  {n.type === "leave_update" ? "Pengajuan Izin" : "Scan Baru"}
                </p>
                <p className="text-xs text-slate-500">{n.employee_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    className="text-[10px]"
                    variant={n.status === "approved" || n.status === "tepat_waktu" ? "default" : "secondary"}
                  >
                    {n.status}
                  </Badge>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.created_at).toLocaleTimeString("id-ID")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
