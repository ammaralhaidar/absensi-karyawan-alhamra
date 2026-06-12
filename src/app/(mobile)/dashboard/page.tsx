"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { RefreshCw, CalendarDays, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmployeeInfoCard } from "@/components/features/EmployeeInfoCard";
import { QRCodeDisplay } from "@/components/features/QRCodeDisplay";
import { AttendanceStatusCard } from "@/components/features/AttendanceStatusCard";
import { ShiftBadge } from "@/components/shared/ShiftBadge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useEmployees, useShifts, useTodayAttendance } from "@/hooks/useData";
import { useSupabase } from "@/lib/supabase/provider";
import Link from "next/link";

export default function DashboardPage() {
  const { data: employeesData, loading: employeesLoading } = useEmployees();
  const { data: shiftsData, loading: shiftsLoading } = useShifts();
  const { data: todayAttendanceData, loading: attendanceLoading } = useTodayAttendance();
  const { user, signOut } = useSupabase();
  
  const [refreshing, setRefreshing] = useState(false);
  const [qrKey, setQrKey] = useState(0);
  const [touchStart, setTouchStart] = useState(0);

  const employee = employeesData[0] ?? null;
  const shift = employee ? (shiftsData.find((s) => s.id === employee.default_shift_id) ?? shiftsData[0] ?? null) : null;
  const todayLog = employee ? todayAttendanceData.find((l) => l.employee_id === employee.id) : null;

  const loading = employeesLoading || shiftsLoading || attendanceLoading;

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setQrKey((k) => k + 1);

    setTimeout(() => {
      setRefreshing(false);
      toast.success("QR Code berhasil diperbarui", {
        description: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      });
    }, 500);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientY - touchStart;
    if (diff > 80 && window.scrollY === 0) {
      handleRefresh();
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <LoadingSkeleton variant="page" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-4">
        <EmptyState
          title="Data karyawan tidak ditemukan"
          description={
            user
              ? "Akun Anda belum terhubung dengan data karyawan. Silakan hubungi admin."
              : "Tidak ada data karyawan yang tersedia"
          }
          action={
            user
              ? {
                  label: "Keluar",
                  onClick: async () => {
                    await signOut();
                    window.location.href = "/login";
                  },
                }
              : undefined
          }
        />
      </div>
    );
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="p-4 space-y-4 pb-6 animate-page-in"
    >
      {/* Pull indicator */}
      <div className="flex justify-center -mb-2">
        <RefreshCw
          className={`w-5 h-5 text-muted-foreground/50 transition-transform duration-300 ${refreshing ? "animate-spin" : ""}`}
        />
      </div>

      {/* Employee Info */}
      <EmployeeInfoCard employee={employee} showShift />

      {/* Shift Info */}
      <Card>
        <CardContent className="py-3.5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-medium">Shift Hari Ini</span>
            <ShiftBadge
              shift={shift?.name ?? "-"}
              timeRange={shift ? `${shift.start_time} - ${shift.end_time}` : "-"}
              size="md"
            />
          </div>
        </CardContent>
      </Card>

      {/* QR Code Display */}
      <QRCodeDisplay
        key={qrKey}
        employeeId={employee.id}
        employeeName={employee.name}
        className="border-primary/20"
      />

      {/* Manual Refresh */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-muted-foreground text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Manual
        </Button>
      </div>

      {/* Attendance Status */}
      {todayLog ? (
        <AttendanceStatusCard log={todayLog} className="border-green-200/50" />
      ) : (
        <Card className="border-amber-200/50 bg-amber-50/30">
          <CardContent className="py-6 text-center">
            <p className="text-sm text-amber-700 font-medium">Belum ada absensi hari ini</p>
            <p className="text-xs text-amber-600/70 mt-1">
              Silakan scan QR Code di Kiosk untuk check-in
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <Link href="/leaves">
          <Button variant="outline" className="w-full h-12 justify-start gap-2 text-sm">
            <CalendarDays className="w-4 h-4 text-primary" />
            <span>Ajukan Izin</span>
          </Button>
        </Link>
        <Button variant="outline" className="w-full h-12 justify-start gap-2 text-sm" disabled>
          <History className="w-4 h-4 text-muted-foreground" />
          <span>Riwayat</span>
        </Button>
      </div>
    </div>
  );
}
