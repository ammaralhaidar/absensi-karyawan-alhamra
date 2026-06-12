"use client";

import { useState, useEffect } from "react";
import { Plus, AlertCircle, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LeaveRequestCard } from "@/components/features/LeaveRequestCard";
import { LeaveForm } from "@/components/features/LeaveForm";
import { LeaveDetail } from "@/components/features/LeaveDetail";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useLeaveRequests, useEmployees } from "@/hooks/useData";
import type { LeaveRequest, LeaveStatus } from "@/types";

export default function LeavesPage() {
  const { data: leaveRequestsData, loading: leaveRequestsLoading } = useLeaveRequests();
  const { data: employeesData } = useEmployees();
  
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LeaveStatus | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Use the first employee as current user (same as dummy data approach)
  const currentEmployee = employeesData[0] ?? null;
  
  const employeeLeaves = currentEmployee 
    ? leaveRequestsData.filter((l) => l.employee_id === currentEmployee.id)
    : leaveRequestsData;

  const pending = employeeLeaves.filter((l) => l.status === "pending");
  const approved = employeeLeaves.filter((l) => l.status === "approved");
  const rejected = employeeLeaves.filter((l) => l.status === "rejected");

  const filtered =
    filter === "all"
      ? employeeLeaves
      : employeeLeaves.filter((l) => l.status === filter);

  useEffect(() => {
    if (!leaveRequestsLoading) {
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [leaveRequestsLoading]);

  const handleCardClick = (req: LeaveRequest) => {
    setSelectedRequest(req);
    setShowDetail(true);
  };

  if (loading) {
    return (
      <div className="p-4">
        <LoadingSkeleton variant="page" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-6 animate-page-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Pengajuan Izin</h1>
          <p className="text-sm text-muted-foreground">
            Riwayat pengajuan cuti, sakit, dan izin
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          size="sm"
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Ajukan
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<AlertCircle className="w-5 h-5 text-amber-600" />}
          value={pending.length}
          label="Pending"
          color="text-amber-600"
          active={filter === "pending"}
          onClick={() => setFilter(filter === "pending" ? "all" : "pending")}
        />
        <StatCard
          icon={<FileText className="w-5 h-5 text-green-600" />}
          value={approved.length}
          label="Disetujui"
          color="text-green-600"
          active={filter === "approved"}
          onClick={() => setFilter(filter === "approved" ? "all" : "approved")}
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-red-600" />}
          value={rejected.length}
          label="Ditolak"
          color="text-red-600"
          active={filter === "rejected"}
          onClick={() => setFilter(filter === "rejected" ? "all" : "rejected")}
        />
      </div>

      {/* Filter Tabs */}
      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as LeaveStatus | "all")}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Disetujui</TabsTrigger>
          <TabsTrigger value="rejected">Ditolak</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-3">
          {filtered.length === 0 ? (
            <EmptyState
              variant="compact"
              icon={<FileText className="w-12 h-12" />}
              title={
                filter === "all"
                  ? "Belum ada pengajuan"
                  : `Tidak ada pengajuan ${filter === "pending" ? "pending" : filter === "approved" ? "disetujui" : "ditolak"}`
              }
              description="Pengajuan cuti, sakit, atau izin Anda akan muncul di sini"
              action={{
                label: "Ajukan Sekarang",
                onClick: () => setShowForm(true),
              }}
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((request, i) => (
                <div key={request.id} className="animate-card-in" style={{ animationDelay: `${i * 60}ms` }}>
                  <LeaveRequestCard
                    request={request}
                    compact
                    onClick={() => handleCardClick(request)}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Ajukan Cuti / Izin</DialogTitle>
          </DialogHeader>
          <LeaveForm
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <LeaveDetail
        open={showDetail}
        onOpenChange={setShowDetail}
        request={selectedRequest}
      />
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Card
      className={`cursor-pointer transition-all duration-150 ${
        active ? "ring-2 ring-primary/30 scale-[1.02]" : "hover:shadow-sm"
      }`}
      onClick={onClick}
    >
      <CardContent className="pt-4 text-center">
        <div className="flex justify-center mb-1">{icon}</div>
        <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </CardContent>
    </Card>
  );
}
