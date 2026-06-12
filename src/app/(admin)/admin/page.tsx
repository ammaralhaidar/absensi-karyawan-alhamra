import { AdminStats } from "@/components/features/AdminStats";
import { QuickActions } from "@/components/features/QuickActions";
import { RecentActivity } from "@/components/features/RecentActivity";
import { DepartmentOverview } from "@/components/features/DepartmentOverview";
import { AnomalyTable } from "@/components/features/AnomalyTable";
import { getEmployees, getLeaveRequests, getShifts, getAdminActivities, getTodayAttendance } from "@/lib/data/hybrid";
import { departmentStats } from "@/lib/dummy-data";
import type { StatItem } from "@/types";

export default async function AdminDashboardPage() {
  const [employees, leaveRequests, shifts, adminActivities, todayAttendance] = await Promise.all([
    getEmployees(),
    getLeaveRequests(),
    getShifts(),
    getAdminActivities(),
    getTodayAttendance(),
  ]);

  const stats: StatItem[] = [
    { label: "Total Karyawan", value: employees.length, icon: "users", color: "primary" },
    { label: "Pending Approval", value: leaveRequests.filter((l) => l.status === "pending").length, icon: "alert", color: "warning" },
    { label: "Hadir Hari Ini", value: todayAttendance.length, icon: "clock", color: "success" },
    { label: "Shift Aktif", value: shifts.length, icon: "layers", color: "info" },
  ];

  return (
    <div className="space-y-6 animate-page-in">
      <div>
        <h1 className="text-2xl font-bold text-[#164e7f]">Dashboard</h1>
        <p className="text-sm text-slate-500">Ringkasan kehadiran dan aktivitas hari ini</p>
      </div>

      <AdminStats stats={stats} />

      <QuickActions />

      <AnomalyTable />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity activities={adminActivities.slice(0, 5)} />
        <DepartmentOverview stats={departmentStats} />
      </div>
    </div>
  );
}
