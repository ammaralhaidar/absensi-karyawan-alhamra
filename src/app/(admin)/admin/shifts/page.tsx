"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Clock, Star, Users } from "lucide-react";
import { toast } from "sonner";
import { useShifts, useEmployees } from "@/hooks/useData";
import { ShiftForm } from "@/components/features/ShiftForm";
import type { Shift } from "@/types";

export default function ShiftsPage() {
  const { data: shiftsData, loading: shiftsLoading } = useShifts();
  const { data: employeesData } = useEmployees();
  const [shiftsList, setShiftsList] = useState<Shift[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | undefined>(undefined);

  useEffect(() => {
    if (shiftsData.length > 0) {
      setShiftsList(shiftsData);
    }
  }, [shiftsData]);

  const getEmployeeCount = (shiftId: string) => employeesData.filter(e => e.default_shift_id === shiftId).length;

  const handleAdd = () => {
    setEditingShift(undefined);
    setFormOpen(true);
  };

  const handleEdit = (shift: Shift) => {
    setEditingShift(shift);
    setFormOpen(true);
  };

  const handleSave = (data: Omit<Shift, "id"> & { id?: string }) => {
    if (data.id) {
      setShiftsList(prev => prev.map(s => s.id === data.id ? { ...s, ...data } : s));
      toast.success("Shift berhasil diupdate");
    } else {
      if (data.is_default) {
        setShiftsList(prev => prev.map(s => ({ ...s, is_default: false })));
      }
      setShiftsList(prev => [...prev, { ...data, id: `shift-${Date.now()}` }]);
      toast.success("Shift berhasil ditambahkan");
    }
    setFormOpen(false);
  };

  const handleDelete = (shift: Shift) => {
    if (shift.is_default) {
      toast.error("Tidak dapat menghapus shift default");
      return;
    }
    const count = getEmployeeCount(shift.id);
    if (count > 0) {
      toast.error(`Tidak dapat menghapus: ${count} karyawan menggunakan shift ini`);
      return;
    }
    setShiftsList(prev => prev.filter(s => s.id !== shift.id));
    toast.success("Shift berhasil dihapus");
  };

  const handleSetDefault = (shift: Shift) => {
    setShiftsList(prev => prev.map(s => ({ ...s, is_default: s.id === shift.id })));
    toast.success(`${shift.name} dijadikan default`);
  };

  const shiftColors: Record<string, string> = {
    "shift-1": "border-[#164e7f]/20 bg-[#164e7f]/5",
    "shift-2": "border-amber-200 bg-amber-50",
    "shift-3": "border-indigo-200 bg-indigo-50",
  };

  if (shiftsLoading) {
    return (
      <div className="space-y-6 animate-page-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#164e7f]">Manajemen Shift</h1>
            <p className="text-sm text-slate-500">Atur jam kerja dan toleransi keterlambatan</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-page-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#164e7f]">Manajemen Shift</h1>
          <p className="text-sm text-slate-500">Atur jam kerja dan toleransi keterlambatan</p>
        </div>
        <Button onClick={handleAdd} className="bg-[#164e7f] hover:bg-[#164e7f]/90">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Shift
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shiftsList.map((shift, i) => {
          const count = getEmployeeCount(shift.id);
          return (
            <Card
              key={shift.id}
              className={`animate-card-in hover:shadow-md transition-shadow border-2 ${shiftColors[shift.id] ?? "border-slate-200"}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#164e7f]" />
                    {shift.is_default && (
                      <Badge className="bg-amber-500 text-white text-[10px]">
                        <Star className="w-3 h-3 mr-0.5 fill-white" />
                        Default
                      </Badge>
                    )}
                    {!shift.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] text-slate-400 hover:text-amber-600"
                        onClick={() => handleSetDefault(shift)}
                      >
                        <Star className="w-3 h-3 mr-0.5" />
                        Set Default
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(shift)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => handleDelete(shift)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <p className="font-bold text-slate-800 text-lg">{shift.name}</p>

                <div className="flex items-center gap-4 mt-3">
                  <div className="text-center">
                    <p className="text-xl font-bold tabular-nums text-[#164e7f]">{shift.start_time}</p>
                    <p className="text-[10px] text-slate-400">Masuk</p>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div className="text-center">
                    <p className="text-xl font-bold tabular-nums text-[#039934]">{shift.end_time}</p>
                    <p className="text-[10px] text-slate-400">Pulang</p>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div>
                    <p className="text-sm font-bold tabular-nums text-slate-700">{shift.late_tolerance_minutes} mnt</p>
                    <p className="text-[10px] text-slate-400">Toleransi</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <Badge variant="outline" className="text-xs font-normal">
                    {count} karyawan
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {shiftsList.length === 0 && (
        <div className="text-center py-16">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Belum ada shift</p>
          <Button onClick={handleAdd} variant="outline" className="mt-3">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Shift
          </Button>
        </div>
      )}

      <ShiftForm
        open={formOpen}
        onOpenChange={setFormOpen}
        shift={editingShift}
        onSave={handleSave}
      />
    </div>
  );
}
