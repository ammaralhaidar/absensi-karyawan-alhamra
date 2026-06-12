"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Building2, Clock, Phone, Mail, Calendar, Shield, Circle } from "lucide-react";
import type { Employee } from "@/types";

interface EmployeeDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
  onEdit?: (employee: Employee) => void;
}

export function EmployeeDetail({ open, onOpenChange, employee, onEdit }: EmployeeDetailProps) {
  const initials = employee.name.split(" ").map(w => w[0]).join("").slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detail Karyawan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-white text-xl font-bold">{initials}</span>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">{employee.name}</p>
              <p className="text-sm text-slate-500">{employee.nik}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={employee.is_active ? "bg-green-500" : "bg-red-500"}>
                  {employee.is_active ? "Aktif" : "Nonaktif"}
                </Badge>
                <Badge variant="outline" className="capitalize">{employee.role.replace("_", " ")}</Badge>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-2.5">
            <Row icon={Building2} label="Departemen" value={employee.department_name} />
            <Row icon={Clock} label="Shift" value={employee.shift_name} />
            <Row icon={Phone} label="Telepon" value={employee.phone} />
            <Row icon={Mail} label="Email" value={employee.email} />
            <Row icon={Calendar} label="Tanggal Masuk" value={new Date(employee.joined_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} />
            <Row icon={Shield} label="Role" value={employee.role === "admin" ? "Admin" : employee.role === "kiosk_security" ? "Kiosk Security" : "Karyawan"} />
            <Row icon={Circle} label="Status" value={employee.is_active ? "Aktif bekerja" : "Tidak aktif"} />
          </div>

          {onEdit && (
            <div className="border-t pt-4 flex gap-2">
              <Button
                className="flex-1 bg-[#164e7f] hover:bg-[#164e7f]/90"
                onClick={() => { onEdit(employee); onOpenChange(false); }}
              >
                Edit Karyawan
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-slate-400 shrink-0" />
      <span className="text-xs text-slate-500 w-24 shrink-0">{label}</span>
      <span className="text-sm text-slate-700 font-medium">{value}</span>
    </div>
  );
}
