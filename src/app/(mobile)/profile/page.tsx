"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Settings, LogOut, Building2, Clock, Hash, UserCheck, RefreshCw, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ShiftBadge } from "@/components/shared/ShiftBadge";
import { DepartmentBadge } from "@/components/shared/DepartmentBadge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useEmployees, useShifts, useMonthlyStats } from "@/hooks/useData";
import Link from "next/link";

export default function ProfilePage() {
  const { data: employeesData, loading: employeesLoading } = useEmployees();
  const { data: shiftsData, loading: shiftsLoading } = useShifts();
  
  const employee = employeesData[0] ?? null;
  const { data: report, loading: statsLoading } = useMonthlyStats(employee?.id);
  
  const shift = employee ? (shiftsData.find((s) => s.id === employee.default_shift_id) ?? shiftsData[0] ?? null) : null;
  
  const initials = employee?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "??";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState(0);

  useEffect(() => {
    if (!employeesLoading && !shiftsLoading && !statsLoading) {
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [employeesLoading, shiftsLoading, statsLoading]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.info("Profil sudah yang terbaru");
    }, 600);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientY - touchStart;
    if (diff > 80 && window.scrollY === 0) handleRefresh();
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
        <LoadingSkeleton variant="page" />
        <p className="text-center text-muted-foreground mt-4">Data karyawan tidak ditemukan</p>
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

      {/* Profile Header */}
      <div className="flex flex-col items-center py-4">
        <Avatar className="w-20 h-20 ring-4 ring-primary/10">
          <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-xl font-bold mt-3">{employee.name}</h1>
        <DepartmentBadge department={employee.department_name} size="md" className="mt-1" />
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Informasi Pribadi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow icon={<Hash className="w-4 h-4" />} label="NIK" value={employee.id} />
          <Separator />
          <InfoRow icon={<Building2 className="w-4 h-4" />} label="Departemen">
            <DepartmentBadge department={employee.department_name} />
          </InfoRow>
          <Separator />
          <InfoRow icon={<Clock className="w-4 h-4" />} label="Shift Default">
            <ShiftBadge
              shift={employee.shift_name}
              timeRange={shift ? `${shift.start_time} - ${shift.end_time}` : "-"}
              size="md"
            />
          </InfoRow>
          <Separator />
          <InfoRow icon={<UserCheck className="w-4 h-4" />} label="Status">
            {employee.is_active ? (
              <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700 font-medium text-xs">
                Aktif
              </Badge>
            ) : (
              <Badge variant="outline" className="border-red-300 bg-red-50 text-red-700 font-medium text-xs">
                Nonaktif
              </Badge>
            )}
          </InfoRow>
        </CardContent>
      </Card>

      {/* Stats Card */}
      {report && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Statistik Bulan Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <StatBox value={report.total_hadir} label="Hadir" color="text-green-600" bg="bg-green-50" />
              <StatBox value={report.total_sakit} label="Sakit" color="text-blue-600" bg="bg-blue-50" />
              <StatBox value={report.total_izin} label="Izin" color="text-purple-600" bg="bg-purple-50" />
              <StatBox value={report.total_cuti} label="Cuti" color="text-amber-600" bg="bg-amber-50" />
              <StatBox value={report.total_terlambat} label="Terlambat" color="text-yellow-600" bg="bg-yellow-50" />
              <StatBox value={`${report.total_jam_kerja.toFixed(1)}h`} label="Jam Kerja" color="text-primary" bg="bg-primary/5" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Link href="/profile/change-password">
        <Button variant="outline" className="w-full justify-start gap-2">
          <Lock className="w-4 h-4" />
          Ubah Password
        </Button>
      </Link>
      <Button variant="outline" className="w-full justify-start gap-2" disabled>
        <Settings className="w-4 h-4" />
        Pengaturan
      </Button>
      <Link href="/">
        <Button variant="destructive" className="w-full justify-start gap-2">
          <LogOut className="w-4 h-4" />
          Keluar
        </Button>
      </Link>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground shrink-0">{icon}</div>
      <span className="text-sm text-muted-foreground w-28 shrink-0">{label}</span>
      <div className="flex-1 text-right">
        {children ?? <span className="text-sm font-medium text-foreground">{value}</span>}
      </div>
    </div>
  );
}

function StatBox({
  value,
  label,
  color,
  bg,
}: {
  value: string | number;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-xl p-3 text-center`}>
      <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
