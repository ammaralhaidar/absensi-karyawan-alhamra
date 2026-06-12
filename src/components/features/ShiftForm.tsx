"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Shift } from "@/types";

interface ShiftFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift?: Shift;
  onSave: (data: Omit<Shift, "id"> & { id?: string }) => void;
}

export function ShiftForm({ open, onOpenChange, shift, onSave }: ShiftFormProps) {
  const isEdit = !!shift;
  const [name, setName] = useState(shift?.name ?? "");
  const [startTime, setStartTime] = useState(shift?.start_time ?? "08:00");
  const [endTime, setEndTime] = useState(shift?.end_time ?? "17:00");
  const [tolerance, setTolerance] = useState(String(shift?.late_tolerance_minutes ?? 15));
  const [isDefault, setIsDefault] = useState(shift?.is_default ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(isEdit ? { id: shift!.id } : {}),
      name,
      start_time: startTime,
      end_time: endTime,
      late_tolerance_minutes: Number(tolerance),
      is_default: isDefault,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Shift" : "Tambah Shift"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Nama Shift</Label>
            <Input value={name} onChange={e => setName(e.target.value)} required className="h-9 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Jam Masuk</Label>
              <Input value={startTime} onChange={e => setStartTime(e.target.value)} type="time" required className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Jam Pulang</Label>
              <Input value={endTime} onChange={e => setEndTime(e.target.value)} type="time" required className="h-9 text-sm" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Toleransi Keterlambatan (menit)</Label>
            <Input value={tolerance} onChange={e => setTolerance(e.target.value)} type="number" min="0" max="120" required className="h-9 text-sm" />
          </div>
          <div className="flex items-center justify-between py-1">
            <div>
              <Label className="text-xs">Shift Default</Label>
              <p className="text-[10px] text-slate-400">Hanya 1 shift default</p>
            </div>
            <Switch checked={isDefault} onCheckedChange={setIsDefault} />
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
