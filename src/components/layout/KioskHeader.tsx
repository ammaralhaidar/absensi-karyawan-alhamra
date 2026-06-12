"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff, Maximize2, ScanLine, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useSupabase } from "@/lib/supabase/provider";

export function KioskHeader() {
  const [online, setOnline] = useState(true);
  const [time, setTime] = useState("");
  const { logout } = useAuth();
  const { signOut: supabaseSignOut } = useSupabase();
  const handleLogout = () => { logout(); supabaseSignOut(); };

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <ScanLine className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-gray-900 font-bold text-base leading-tight">Kiosk Scanner</h1>
          <p className="text-gray-400 text-[10px] leading-tight">Alhamra Attendance</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-gray-600 text-sm font-mono tabular-nums hidden sm:block">
          {time}
        </span>
        <Badge
          variant="outline"
          className={
            online
              ? "border-green-200 text-green-700 bg-green-50"
              : "border-red-200 text-red-700 bg-red-50"
          }
        >
          {online ? (
            <Wifi className="w-3 h-3 mr-1" />
          ) : (
            <WifiOff className="w-3 h-3 mr-1" />
          )}
          <span className="text-xs">{online ? "Online" : "Offline"}</span>
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          onClick={toggleFullscreen}
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
