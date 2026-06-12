"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Employee, Role, Department, Shift } from "@/types";

interface EmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee;
  departments: Department[];
  shifts: Shift[];
  onSave: (data: Omit<Employee, "id"> & { id?: string }) => void;
}

export function EmployeeForm({ open, onOpenChange, employee, departments, shifts, onSave }: EmployeeFormProps) {
  const isEdit = !!employee;

  const [nik, setNik] = useState(employee?.nik ?? "");
  const [name, setName] = useState(employee?.name ?? "");
  const [departmentId, setDepartmentId] = useState(employee?.department_id ?? "dept-1");
  const [shiftId, setShiftId] = useState(employee?.default_shift_id ?? "shift-1");
  const [role, setRole] = useState<Role>(employee?.role ?? "employee");
  const [phone, setPhone] = useState(employee?.phone ?? "");
  const [email, setEmail] = useState(employee?.email ?? "");
  const [joinedAt, setJoinedAt] = useState(employee?.joined_at ?? "2026-01-01");
  const [isActive, setIsActive] = useState(employee?.is_active ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dept = departments.find(d => d.id === departmentId);
    const shift = shifts.find(s => s.id === shiftId);
    onSave({
      ...(isEdit ? { id: employee!.id } : {}),
      nik,
      name,
      department_id: departmentId,
      department_name: dept?.name ?? "",
      default_shift_id: shiftId,
      shift_name: shift?.name ?? "",
      role,
      phone,
      email,
      joined_at: joinedAt,
      is_active: isActive,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Karyawan" : "Tambah Karyawan"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">NIK</Label>
              <Input value={nik} onChange={e => setNik(e.target.value)} required className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nama</Label>
              <Input value={name} onChange={e => setName(e.target.value)} required className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Departemen</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Shift Default</Label>
              <Select value={shiftId} onValueChange={setShiftId}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Karyawan</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="kiosk_security">Kiosk Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={isActive ? "active" : "inactive"} onValueChange={(v) => setIsActive(v === "active")}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Telepon</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} type="email" className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tanggal Masuk</Label>
              <Input value={joinedAt} onChange={e => setJoinedAt(e.target.value)} type="date" className="h-9 text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" className="bg-[#164e7f] hover:bg-[#164e7f]/90">{isEdit ? "Simpan" : "Tambah"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
